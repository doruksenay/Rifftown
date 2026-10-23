// Özel mesajlaşma: iki oyuncu arasındaki konuşma.

import type { DirectMessageDto, PersonDto } from '@rifftown/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { confirmThen } from '@/components/careers';
import { useGate } from '@/components/gate';
import { Avatar, Body, Button, Small, Strong, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { fonts, radius, space, type, useColors } from '@/theme';

type Thread = { person: PersonDto; blocked: boolean; messages: DirectMessageDto[] };

export default function MessageThread() {
  const gate = useGate();
  if (gate) return gate;
  return <ThreadScreen />;
}

function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, err, locale } = useI18n();
  const c = useColors();
  const toast = useToast();
  const qc = useQueryClient();
  const [data, setData] = useState<Thread | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const list = useRef<FlatList<DirectMessageDto>>(null);
  const lastCount = useRef(-1);

  const load = useCallback(async () => {
    try {
      const r = await api.get<Thread>(`/messages/${id}`);
      setData(r);
      const unread = r.messages.length !== lastCount.current;
      lastCount.current = r.messages.length;
      if (unread) {
        qc.invalidateQueries({ queryKey: ['me'] });
        qc.invalidateQueries({ queryKey: ['conversations'] });
      }
    } catch (e) {
      if (!data) toast(err(e), 'error');
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    const h = setInterval(load, 4000);
    return () => clearInterval(h);
  }, [load]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      await api.post(`/messages/${id}`, { text: body });
      setText('');
      await load();
    } catch (e) {
      toast(err(e), 'error');
    } finally {
      setSending(false);
    }
  };

  const person = data?.person;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen
        options={{
          title: person?.name ?? t('messages'),
          headerRight: person
            ? () => (
                <Pressable onPress={() => router.push(`/character/${person.characterId}`)} accessibilityRole="button" accessibilityLabel={t('profile')}>
                  <Avatar name={person.name} color={person.avatarColor} uri={person.avatarUrl} size={30} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <FlatList
        ref={list}
        data={data?.messages ?? []}
        keyExtractor={(m) => String(m.id)}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: space.lg, gap: space.sm, maxWidth: 640, width: '100%', alignSelf: 'center', flexGrow: 1 }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={data ? <Body color={c.inkSoft}>{t('chatEmpty')}</Body> : undefined}
        renderItem={({ item }) => (
          <Pressable
            style={{ alignSelf: item.mine ? 'flex-end' : 'flex-start', maxWidth: '82%' }}
            disabled={item.mine}
            onLongPress={() =>
              confirmThen(t('report'), t('reportMessageQ'), t('report'), t('cancel'), () => {
                api.post('/reports', { kind: 'message', targetId: item.id, text: '' }).then(() => toast(t('reported')), (e) => toast(err(e), 'error'));
              })
            }
          >
            <View
              style={{
                backgroundColor: item.mine ? c.pink : c.surface,
                borderWidth: item.mine ? 0 : 1,
                borderColor: c.line,
                borderRadius: 14,
                paddingHorizontal: space.md,
                paddingVertical: space.sm,
              }}
            >
              <Body color={item.mine ? c.onInk : c.ink}>{item.text}</Body>
            </View>
            <Small style={{ fontSize: type.caption, alignSelf: item.mine ? 'flex-end' : 'flex-start', marginTop: 2 }}>
              {new Date(item.createdAt).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </Small>
          </Pressable>
        )}
      />
      {data?.blocked ? (
        <View style={{ padding: space.lg, borderTopWidth: 1, borderTopColor: c.line }}>
          <Strong color={c.danger}>{t('blockedByThem')}</Strong>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('messagePlaceholder')}
            placeholderTextColor={c.inkSoft}
            maxLength={2000}
            multiline
            style={{
              flex: 1,
              fontFamily: fonts.body,
              fontSize: type.body,
              color: c.ink,
              borderWidth: 1.5,
              borderColor: c.line,
              borderRadius: radius.control,
              paddingHorizontal: space.md,
              paddingVertical: space.sm,
              backgroundColor: c.paper,
              maxHeight: 120,
            }}
          />
          <Button title={t('send')} onPress={send} loading={sending} disabled={!text.trim()} small />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
