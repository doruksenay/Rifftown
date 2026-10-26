import { CHAT_MAX, CITY_BY_ID, type ChatMessageDto, type ConversationDto } from '@rifftown/shared';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Body, Button, Choice, Empty, ListRow, Small, Strong, useToast } from '@/components/ui';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { useMe } from '@/lib/session';
import { fonts, radius, space, type, useColors } from '@/theme';

export default function ChatTab() {
  const params = useLocalSearchParams<{ channel?: string }>();
  const me = useMe();
  const { t, p, err, locale } = useI18n();
  const toast = useToast();
  const c = useColors();
  const ch = me.data!.character!;
  const band = me.data!.band;
  const [mode, setMode] = useState<'city' | 'band' | 'dm'>(params.channel === 'band' ? 'band' : params.channel === 'dm' ? 'dm' : 'city');
  useEffect(() => {
    if (params.channel === 'band' || params.channel === 'city' || params.channel === 'dm') setMode(params.channel);
  }, [params.channel]);
  const unread = me.data!.unreadMessages ?? 0;

  const channel = mode === 'city' ? (ch.cityId ? `city:${ch.cityId}` : null) : mode === 'band' && band ? `band:${band.id}` : null;
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const list = useRef<FlatList<ChatMessageDto>>(null);

  const load = useCallback(
    async (fresh: boolean) => {
      if (!channel) return;
      try {
        const q = fresh || !lastId.current ? '' : `&after=${lastId.current}`;
        const r = await api.get<{ messages: ChatMessageDto[] }>(`/chat?channel=${encodeURIComponent(channel)}${q}`);
        if (r.messages.length) lastId.current = r.messages[r.messages.length - 1].id;
        setMessages((m) => (fresh ? r.messages : [...m, ...r.messages]));
      } catch {
        /* bağlantı kopukluğunda sessizce tekrar dener */
      }
    },
    [channel],
  );

  useEffect(() => {
    lastId.current = 0;
    setMessages([]);
    load(true);
    const id = setInterval(() => load(false), 4000);
    return () => clearInterval(id);
  }, [load]);

  const send = async () => {
    if (!channel || !text.trim()) return;
    setSending(true);
    try {
      await api.post('/chat', { channel, text: text.trim() });
      setText('');
      await load(false);
    } catch (e) {
      toast(err(e), 'error');
    } finally {
      setSending(false);
    }
  };

  const title = mode === 'dm' ? t('messages') : mode === 'city' ? (ch.cityId ? p(CITY_BY_ID[ch.cityId].name) : t('traveling')) : band?.name ?? t('bandChat');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.paper }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.md, gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
          <Body style={{ fontFamily: fonts.display, fontSize: type.display, lineHeight: type.display * 1.15 }} numberOfLines={1}>
            {title}
          </Body>
          <Choice
            options={[
              { value: 'city', label: t('cityChat') },
              { value: 'band', label: t('bandChat') },
              { value: 'dm', label: unread ? t('messagesN', { n: unread }) : t('messages') },
            ]}
            value={mode}
            onChange={setMode}
          />
        </View>

        {mode === 'dm' ? (
          <Conversations />
        ) : !channel ? (
          <View style={{ padding: space.lg }}>
            <Body color={c.inkSoft}>{mode === 'city' ? t('chatTraveling') : t('chatNoBand')}</Body>
            {mode === 'band' ? <Button title={t('createBand')} variant="secondary" style={{ marginTop: space.lg }} onPress={() => router.navigate('/band')} /> : null}
          </View>
        ) : (
          <>
            <FlatList
              ref={list}
              data={messages}
              keyExtractor={(m) => String(m.id)}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.md, maxWidth: 640, width: '100%', alignSelf: 'center', flexGrow: 1 }}
              onContentSizeChange={() => list.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={<Body color={c.inkSoft}>{t('chatEmpty')}</Body>}
              renderItem={({ item }) => {
                const mine = item.characterId === ch.id;
                return (
                  <View style={{ flexDirection: 'row', gap: space.sm, paddingVertical: space.sm, alignItems: 'flex-start' }}>
                    <Pressable onPress={() => router.push(`/character/${item.characterId}`)} accessibilityRole="link" accessibilityLabel={item.name}>
                      <Avatar name={item.name} color={item.avatarColor} uri={item.avatarUrl} size={32} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'baseline' }}>
                        <Pressable onPress={() => router.push(`/character/${item.characterId}`)} accessibilityRole="link" hitSlop={6}>
                          <Strong color={mine ? c.pink : c.ink} style={{ fontSize: type.small }}>
                            {item.name}
                          </Strong>
                        </Pressable>
                        <Small style={{ fontSize: type.caption }}>
                          {new Date(item.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </Small>
                      </View>
                      <Body>{item.text}</Body>
                    </View>
                  </View>
                );
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                gap: space.sm,
                padding: space.md,
                borderTopWidth: 1,
                borderTopColor: c.line,
                backgroundColor: c.surface,
              }}
            >
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t('messagePlaceholder')}
                placeholderTextColor={c.inkSoft}
                maxLength={CHAT_MAX}
                onSubmitEditing={send}
                returnKeyType="send"
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
                }}
              />
              <Button title={t('send')} onPress={send} loading={sending} disabled={!text.trim()} small />
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Conversations() {
  const { t, locale } = useI18n();
  const c = useColors();
  const q = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get<{ conversations: ConversationDto[] }>('/messages').then((r) => r.conversations),
    refetchInterval: 8000,
  });
  const list = q.data ?? [];
  return (
    <FlatList
      data={list}
      keyExtractor={(x) => String(x.characterId)}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}
      ListEmptyComponent={q.isLoading ? undefined : <Empty text={t('noConversations')} action={<Button title={t('friendsTitle')} variant="secondary" onPress={() => router.push('/friends')} />} />}
      ListHeaderComponent={list.length ? <Button title={t('friendsTitle')} small variant="ghost" style={{ alignSelf: 'flex-end' }} onPress={() => router.push('/friends')} /> : undefined}
      renderItem={({ item, index }) => (
        <ListRow
          left={<Avatar name={item.name} color={item.avatarColor} uri={item.avatarUrl} size={40} />}
          title={item.name}
          subtitle={`${item.lastMine ? `${t('you')}: ` : ''}${item.lastText}`}
          right={
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Small style={{ fontSize: type.caption }}>{new Date(item.lastAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</Small>
              {item.unread ? (
                <View style={{ backgroundColor: c.pink, borderRadius: radius.pill, minWidth: 20, paddingHorizontal: 6, alignItems: 'center' }}>
                  <Strong color={c.onInk} style={{ fontSize: type.caption }}>{String(item.unread)}</Strong>
                </View>
              ) : null}
            </View>
          }
          onPress={() => router.push(`/messages/${item.characterId}`)}
          last={index === list.length - 1}
        />
      )}
    />
  );
}
