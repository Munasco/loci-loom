import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Path } from 'react-native-svg';
import { generateTrail, starterTrail, type MemoryTrail } from './src/domain/trails';
import type { TrailGenerator } from './src/domain/trailGenerator';
import { DemoBillingGateway, type BillingGateway } from './src/domain/billing';
import { AsyncTrailRepository } from './src/services/asyncTrailRepository';
import { createRevenueCatBilling } from './src/services/revenueCatSdk';
import { HttpTrailGenerator } from './src/services/httpTrailGenerator';
import { applyRecallResult, buildRecallQuestions, reviewTimingLabel } from './src/domain/recall';

type Screen = 'home' | 'create' | 'map' | 'trail' | 'recall' | 'results' | 'paywall' | 'library';
const colors = { ink: '#171828', paper: '#F7F4EC', plum: '#542B66', violet: '#8659A6', lavender: '#DCC8F2', coral: '#FF7657', mint: '#C8E6D0', white: '#FFFFFF', muted: '#727180' };
const revenueCatKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
const billing: BillingGateway = revenueCatKey ? createRevenueCatBilling(revenueCatKey) : new DemoBillingGateway();
const repository = new AsyncTrailRepository();
const trailApiUrl = process.env.EXPO_PUBLIC_TRAIL_API_URL;
const remoteGenerator = trailApiUrl ? new HttpTrailGenerator(trailApiUrl) : undefined;
const generator: TrailGenerator = { generate: async (topic, sourceText) => {
  const normalized = topic.toLowerCase();
  const hasCuratedDemo = ['immune', 'sql', 'join', 'french', 'verb'].some(keyword => normalized.includes(keyword));
  return (hasCuratedDemo && !sourceText?.trim()) || !remoteGenerator ? generateTrail(topic) : remoteGenerator.generate(topic, sourceText);
} };

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [topic, setTopic] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [trail, setTrail] = useState<MemoryTrail>(starterTrail);
  const [scene, setScene] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [recallIndex, setRecallIndex] = useState(0);
  const [recallAnswers, setRecallAnswers] = useState<number[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [savedTrails, setSavedTrails] = useState<MemoryTrail[]>([starterTrail]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const go = (next: Screen) => { Haptics.selectionAsync().catch(() => undefined); setScreen(next); };
  const progress = useMemo(() => `${scene + 1} / ${trail.scenes.length}`, [scene, trail]);
  const recallQuestions = useMemo(() => buildRecallQuestions(trail), [trail]);
  const featuredTrail = savedTrails[0] ?? starterTrail;
  const createdTrailCount = savedTrails.filter(item => item.id !== starterTrail.id).length;
  const freeLimitReached = !isPro && createdTrailCount >= 3;
  useEffect(() => { billing.getAccess().then(access => setIsPro(access === 'scholar')).catch(() => undefined); }, []);
  useEffect(() => { repository.list().then(items => { if (items.length) setSavedTrails(items); }).catch(() => undefined); }, []);
  const beginRecall = () => { setRecallIndex(0); setRecallAnswers([]); setAnswer(null); go('recall'); };
  const advanceRecall = async () => {
    if (answer === null) return;
    const nextAnswers = [...recallAnswers, answer];
    if (recallIndex < recallQuestions.length - 1) {
      setRecallAnswers(nextAnswers);
      setRecallIndex(value => value + 1);
      setAnswer(null);
      return;
    }
    const correct = nextAnswers.filter((selected, index) => selected === recallQuestions[index].correct).length;
    const updated = applyRecallResult(trail, correct, recallQuestions.length);
    setTrail(updated);
    setSavedTrails(items => [updated, ...items.filter(item => item.id !== updated.id)]);
    await repository.save(updated);
    go('results');
  };

  if (screen === 'create') return <Shell><TopBar title="New memory trail" onBack={() => go('home')} /><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.spark}><Text style={styles.sparkText}>✦</Text></View><Text style={styles.hero}>What do you want to remember?</Text>
    <Text style={styles.sub}>We’ll turn it into five strange, visual stops your mind can revisit.</Text><Text style={styles.label}>TOPIC OR CONCEPT</Text>
    <TextInput accessibilityLabel="Topic" value={topic} onChangeText={setTopic} placeholder="e.g. How photosynthesis works" placeholderTextColor="#9994A0" multiline style={styles.input} />
    <View style={styles.suggestionRow}>{['The immune system', 'SQL joins', 'French verbs'].map(item => <Pressable key={item} onPress={() => setTopic(item)} style={styles.chip}><Text style={styles.chipText}>{item}</Text></Pressable>)}</View>
    <Text style={styles.label}>SOURCE NOTES · OPTIONAL</Text><TextInput accessibilityLabel="Source notes" value={sourceText} onChangeText={setSourceText} placeholder="Paste a lecture excerpt or study notes for a source-grounded trail" placeholderTextColor="#9994A0" multiline maxLength={6000} style={styles.sourceInput} /><Text style={styles.sourceHelp}>{sourceText.length.toLocaleString()} / 6,000 · Your notes are used only to weave this trail.</Text>
    {generationError && <View style={styles.errorCard}><Text style={styles.errorTitle}>The trail could not be woven</Text><Text style={styles.errorText}>{generationError}</Text></View>}
    <PrimaryButton label={isGenerating ? 'Weaving your world…' : 'Weave my trail'} disabled={!topic.trim() || isGenerating} onPress={async () => { try { setGenerationError(null); setIsGenerating(true); const next = await generator.generate(topic, sourceText); setTrail(next); setSavedTrails(items => [next, ...items.filter(item => item.id !== next.id)]); await repository.save(next); setScene(0); setRecallIndex(0); setRecallAnswers([]); setAnswer(null); go('map'); } catch (error) { const message = error instanceof Error ? error.message : 'Please try again.'; setGenerationError(message); Alert.alert('The trail could not be woven', message); } finally { setIsGenerating(false); } }} />
  </ScrollView></Shell>;

  if (screen === 'map') return <Shell><TopBar title="Your memory palace" onBack={() => go('home')} /><ScrollView contentContainerStyle={styles.mapPage}>
    <Text style={styles.mapEyebrow}>{trail.sourceProvided ? 'WOVEN FROM YOUR NOTES' : 'YOUR FIVE-STOP ROUTE'}</Text><Text style={styles.mapTitle}>{trail.topic}</Text><Text style={styles.mapIntro}>Walk the landmarks in order. The route becomes a retrieval cue even when the explanations disappear.</Text>
    <TrailMap trail={trail} />
    <View style={styles.mapHint}><Text style={styles.mapHintIcon}>✦</Text><Text style={styles.mapHintText}>Each place stays fixed, so your mind can return to the same path during review.</Text></View>
    <PrimaryButton label="Enter the first stop" onPress={() => { setScene(0); go('trail'); }} />
  </ScrollView></Shell>;

  if (screen === 'trail') {
    const current = trail.scenes[scene];
    return <Shell dark><LinearGradient colors={current.gradient} style={styles.full}><SafeAreaView style={styles.full}>
      <View style={styles.trailTop}><Pressable accessibilityLabel="Close trail" onPress={() => go('home')}><Text style={styles.close}>×</Text></Pressable><Text style={styles.progress}>{progress}</Text><Pressable accessibilityLabel="Scholar Pass" onPress={() => go('paywall')}><Text style={styles.sound}>✦</Text></Pressable></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((scene + 1) / trail.scenes.length) * 100}%` }]} /></View>
      <View style={styles.routeDots}>{trail.scenes.map((item, index) => <View key={item.place} style={[styles.routeDot, index === scene && styles.routeDotActive, index < scene && styles.routeDotVisited]} />)}</View>
      <View style={styles.sceneWrap}><Text style={styles.sceneEyebrow}>STOP {scene + 1} · {current.place.toUpperCase()}</Text><Text style={styles.emoji}>{current.emoji}</Text><Text style={styles.sceneTitle}>{current.title}</Text><Text style={styles.sceneStory}>{current.story}</Text><View style={styles.anchorCard}><Text style={styles.anchorLabel}>MEMORY ANCHOR</Text><Text style={styles.anchor}>{current.anchor}</Text></View></View>
      <View style={styles.bottomAction}><PrimaryButton light label={scene === trail.scenes.length - 1 ? 'Test my memory' : 'Walk to the next stop'} onPress={() => { if (scene < trail.scenes.length - 1) setScene(value => value + 1); else beginRecall(); }} /></View>
    </SafeAreaView></LinearGradient></Shell>;
  }

  if (screen === 'recall') {
    const question = recallQuestions[recallIndex];
    return <Shell><TopBar title="Quick recall" onBack={() => go('trail')} /><View style={styles.page}><Text style={styles.recallCount}>{recallIndex + 1} OF {recallQuestions.length}</Text><Text style={styles.hero}>{question.prompt}</Text>
      <View style={styles.optionList}>{question.options.map((option, index) => { const selected = answer === index; const correct = answer !== null && index === question.correct; return <Pressable key={option} disabled={answer !== null} onPress={() => setAnswer(index)} style={[styles.option, selected && styles.optionSelected, correct && styles.optionCorrect]}><Text style={styles.optionKey}>{String.fromCharCode(65 + index)}</Text><Text style={styles.optionText}>{option}</Text></Pressable>; })}</View>
      {answer !== null && <View style={styles.feedback}><Text style={styles.feedbackTitle}>{answer === question.correct ? 'That trail held.' : 'Nearly—walk it once more.'}</Text><Text style={styles.feedbackText}>{question.explanation}</Text></View>}
      <PrimaryButton label={answer === null ? 'Choose an answer' : recallIndex === recallQuestions.length - 1 ? 'See my memory trace' : 'Continue'} disabled={answer === null} onPress={() => { void advanceRecall(); }} />
    </View></Shell>;
  }

  if (screen === 'results') {
    const review = trail.review;
    return <Shell><TopBar title="Recall result" onBack={() => go('home')} /><ScrollView contentContainerStyle={styles.resultPage}>
      <Text style={styles.resultEyebrow}>RECALL COMPLETE</Text><Text style={styles.resultScore}>{review?.lastScore ?? 0}<Text style={styles.resultTotal}> / {review?.totalQuestions ?? 3}</Text></Text>
      <Text style={styles.resultTitle}>{review?.strength === 100 ? 'This trail is holding.' : review && review.strength >= 60 ? 'The route is taking shape.' : 'This route needs another pass.'}</Text>
      <Text style={styles.sub}>Loci Loom changes the review interval from what you retrieved—not how familiar the page felt.</Text>
      <View style={styles.traceCard}><View style={styles.traceHeader}><Text style={styles.traceLabel}>RECALL ACCURACY</Text><Text style={styles.traceValue}>{review?.strength ?? 0}%</Text></View><View style={styles.traceTrack}><View style={[styles.traceFill, { width: `${review?.strength ?? 0}%` }]} /></View><Text style={styles.traceTiming}>{reviewTimingLabel(review)}</Text></View>
      <PrimaryButton label="Explore Scholar Pass" onPress={() => go('paywall')} />
      <Pressable onPress={() => go('home')}><Text style={styles.resultHome}>Return home</Text></Pressable>
    </ScrollView></Shell>;
  }

  if (screen === 'library') return <Shell><TopBar title="Your trails" onBack={() => go('home')} /><ScrollView contentContainerStyle={styles.libraryPage}>
    <Text style={styles.libraryTitle}>Places your mind{`\n`}can return to.</Text><Text style={styles.sub}>{savedTrails.length} saved {savedTrails.length === 1 ? 'trail' : 'trails'} · {isPro ? 'Scholar Pass' : 'Free plan'}</Text>
    <View style={styles.libraryList}>{savedTrails.map((item) => <Pressable key={item.id} onPress={() => { setTrail(item); setScene(0); go('map'); }} style={styles.libraryCard}><LinearGradient colors={item.scenes[0].gradient} style={styles.libraryArt}><Text style={styles.libraryEmoji}>{item.scenes[0].emoji}</Text></LinearGradient><View style={styles.libraryBody}><Text style={styles.libraryTopic}>{item.topic}</Text><Text style={styles.libraryMeta}>5 stops · {reviewTimingLabel(item.review)}</Text></View><Text style={styles.chev}>›</Text></Pressable>)}</View>
    <PrimaryButton label={freeLimitReached ? 'Unlock unlimited trails' : 'Weave another trail'} onPress={() => go(freeLimitReached ? 'paywall' : 'create')} />
  </ScrollView></Shell>;

  if (screen === 'paywall') return <Shell><TopBar title="" onBack={() => go('home')} /><ScrollView contentContainerStyle={styles.paywall}>
    <View style={styles.orbit}><Text style={styles.orbitEmoji}>🪐</Text></View><Text style={styles.payTitle}>Build a path back to what matters.</Text><Text style={styles.sub}>Scholar Pass keeps every subject available for repeated, adaptive retrieval.</Text>
    <View style={styles.benefits}>{['Unlimited memory trails', 'Adaptive reviews across every subject', 'A growing library of visual worlds', 'Restore access on your devices'].map(item => <View key={item} style={styles.benefit}><Text style={styles.check}>✓</Text><Text style={styles.benefitText}>{item}</Text></View>)}</View>
    <View style={styles.plan}><View><Text style={styles.best}>FULL ACCESS</Text><Text style={styles.planName}>Scholar Pass · Annual</Text><Text style={styles.planSub}>{revenueCatKey ? 'Price and terms shown in secure checkout' : 'Interactive demo entitlement'}</Text></View><Text style={styles.radio}>●</Text></View>
    <PrimaryButton label={isPurchasing ? 'Opening secure checkout…' : 'Continue with Scholar Pass'} disabled={isPurchasing} onPress={async () => { try { setIsPurchasing(true); const access = await billing.purchaseScholarPass(); setIsPro(access === 'scholar'); if (access === 'scholar') go('home'); } catch (error) { Alert.alert('Purchase unavailable', error instanceof Error ? error.message : 'Please try again.'); } finally { setIsPurchasing(false); } }} />
    <Pressable onPress={async () => { try { setIsPro((await billing.restore()) === 'scholar'); } catch { Alert.alert('Nothing to restore', 'No previous Scholar Pass was found.'); } }}><Text style={styles.fine}>{revenueCatKey ? 'Cancel anytime · Restore purchases' : 'Demo purchase mode · Restore purchases'}</Text></Pressable>
  </ScrollView></Shell>;

  return <Shell><ScrollView contentContainerStyle={styles.home}>
    <View style={styles.brandRow}><View><Text style={styles.brand}>Loci</Text><Text style={styles.brandAccent}>Loom</Text></View><Pressable accessibilityLabel="Scholar Pass" onPress={() => go('paywall')} style={styles.avatar}><Text>{isPro ? '✦' : 'ME'}</Text></Pressable></View>
    <Text style={styles.kicker}>GOOD {new Date().getHours() < 12 ? 'MORNING' : 'EVENING'}</Text><Text style={styles.hero}>Where will your mind{`\n`}wander today?</Text>
    <Pressable accessibilityRole="button" onPress={() => go(freeLimitReached ? 'paywall' : 'create')} style={styles.createCard}><LinearGradient colors={[colors.plum, '#7D3F79']} style={styles.createGradient}><Text style={styles.createPlus}>＋</Text><View style={styles.createCopy}><Text style={styles.createTitle}>Weave a new trail</Text><Text style={styles.createSub}>{freeLimitReached ? 'Scholar Pass unlocks unlimited trails' : 'Turn any topic into a vivid world'}</Text></View><Text style={styles.arrow}>→</Text></LinearGradient></Pressable>
    <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Continue wandering</Text><Pressable onPress={() => go('library')}><Text style={styles.seeAll}>SEE ALL</Text></Pressable></View>
    <Pressable onPress={() => { setTrail(featuredTrail); setScene(0); go('map'); }} style={styles.trailCard}><LinearGradient colors={featuredTrail.scenes[0].gradient} style={styles.trailArt}><Text style={styles.trailEmoji}>{featuredTrail.scenes[0].emoji}</Text><View style={styles.trailBadge}><Text style={styles.trailBadgeText}>{featuredTrail.review ? `${featuredTrail.review.strength}% RECALL` : 'NEW TRAIL'}</Text></View></LinearGradient><View style={styles.trailBody}><Text style={styles.trailTopic}>{featuredTrail.topic}</Text><Text style={styles.trailMeta}>{reviewTimingLabel(featuredTrail.review)}</Text><View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${featuredTrail.review?.strength ?? 20}%` }]} /></View></View></Pressable>
    <View style={styles.streak}><Text style={styles.streakIcon}>🧭</Text><View style={styles.flex}><Text style={styles.streakTitle}>Adaptive review</Text><Text style={styles.streakSub}>{featuredTrail.review ? 'Your next walk follows your recall accuracy.' : 'Complete a recall round to schedule the next walk.'}</Text></View><Text style={styles.chev}>›</Text></View>
  </ScrollView></Shell>;
}

function Shell({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) { return <View style={[styles.shell, dark && styles.shellDark]}><StatusBar style={dark ? 'light' : 'dark'} />{children}</View>; }
function TopBar({ title, onBack }: { title: string; onBack: () => void }) { return <SafeAreaView><View style={styles.topBar}><Pressable accessibilityLabel="Back" onPress={onBack}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.topTitle}>{title}</Text><View style={styles.backSpacer} /></View></SafeAreaView>; }
function PrimaryButton({ label, onPress, disabled = false, light = false }: { label: string; onPress: () => void; disabled?: boolean; light?: boolean }) { return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.primary, light && styles.primaryLight, disabled && styles.primaryDisabled]}><Text style={[styles.primaryText, light && styles.primaryTextLight]}>{label}</Text><Text style={[styles.primaryArrow, light && styles.primaryTextLight]}>→</Text></Pressable>; }

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.paper }, shellDark: { backgroundColor: colors.plum }, full: { flex: 1 }, flex: { flex: 1 }, backSpacer: { width: 32 }, miniFill: { width: '60%', height: 4, borderRadius: 4, backgroundColor: colors.coral },
  page: { paddingHorizontal: 24, paddingBottom: 36, flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', boxSizing: 'border-box' }, home: { padding: 24, paddingTop: Platform.OS === 'web' ? 44 : 70, paddingBottom: 42, width: '100%', maxWidth: 480, alignSelf: 'center', boxSizing: 'border-box' }, brandRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }, brand: { fontSize: 25, lineHeight: 24, fontWeight: '900', color: colors.ink, letterSpacing: -1.3 }, brandAccent: { fontSize: 25, lineHeight: 24, fontWeight: '900', color: colors.coral, letterSpacing: -1.3 }, avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  kicker: { color: colors.coral, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 10 }, hero: { color: colors.ink, fontSize: 39, lineHeight: 43, fontWeight: '800', letterSpacing: -1.4, width: '100%', flexShrink: 1 }, sub: { fontSize: 17, lineHeight: 25, color: colors.muted, marginTop: 14, marginBottom: 30 },
  createCard: { width: '100%', marginTop: 34, borderRadius: 24, overflow: 'hidden', shadowColor: colors.plum, shadowOpacity: .25, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 8 }, createGradient: { minHeight: 112, padding: 22, flexDirection: 'row', alignItems: 'center', gap: 15 }, createCopy: { flex: 1, minWidth: 0 }, createPlus: { color: colors.white, fontSize: 32, fontWeight: '200' }, createTitle: { color: colors.white, fontSize: 18, fontWeight: '800' }, createSub: { color: '#EADDF0', fontSize: 13, marginTop: 5 }, arrow: { color: colors.white, fontSize: 25 },
  sectionRow: { width: '100%', marginTop: 40, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { color: colors.ink, fontWeight: '800', fontSize: 19 }, seeAll: { color: colors.violet, fontSize: 11, letterSpacing: 1.4, fontWeight: '800' }, trailCard: { width: '100%', backgroundColor: colors.white, borderRadius: 22, overflow: 'hidden', flexDirection: 'row' }, trailArt: { width: 116, minHeight: 132, alignItems: 'center', justifyContent: 'center' }, trailEmoji: { fontSize: 44 }, trailBadge: { position: 'absolute', bottom: 9, backgroundColor: 'rgba(255,255,255,.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }, trailBadgeText: { fontSize: 8, fontWeight: '900', color: colors.ink }, trailBody: { flex: 1, minWidth: 0, padding: 17, justifyContent: 'center' }, trailTopic: { fontSize: 17, fontWeight: '800', color: colors.ink, flexShrink: 1 }, trailMeta: { fontSize: 12, marginTop: 6, color: colors.muted, flexShrink: 1 }, miniTrack: { height: 4, backgroundColor: '#EDE8E2', borderRadius: 4, marginTop: 18 },
  streak: { marginTop: 17, padding: 17, backgroundColor: '#FFF0D6', borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 13 }, streakIcon: { fontSize: 28 }, streakTitle: { fontWeight: '800', color: colors.ink }, streakSub: { fontSize: 12, color: colors.muted, marginTop: 3 }, chev: { fontSize: 28, color: colors.muted }, topBar: { height: 70, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { color: colors.ink, fontSize: 38, fontWeight: '300' }, topTitle: { color: colors.ink, fontWeight: '800', fontSize: 16 }, spark: { marginTop: 30, width: 58, height: 58, borderRadius: 18, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }, sparkText: { color: colors.plum, fontSize: 28 },
  label: { color: colors.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1.6, marginBottom: 10 }, input: { minHeight: 130, borderWidth: 1.5, borderColor: '#D9D2CB', borderRadius: 20, padding: 18, color: colors.ink, fontSize: 18, textAlignVertical: 'top', backgroundColor: colors.white }, suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13, marginBottom: 28 }, chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#ECE6F1' }, chipText: { color: colors.plum, fontSize: 12, fontWeight: '700' },
  sourceInput: { minHeight: 96, borderWidth: 1.5, borderColor: '#D9D2CB', borderRadius: 18, padding: 15, color: colors.ink, fontSize: 15, lineHeight: 21, textAlignVertical: 'top', backgroundColor: colors.white }, sourceHelp: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 7, marginBottom: 20 },
  errorCard: { backgroundColor: '#FDE6DF', borderRadius: 16, padding: 14, marginBottom: 16 }, errorTitle: { color: '#8B2F25', fontSize: 13, fontWeight: '900' }, errorText: { color: '#793D36', fontSize: 12, lineHeight: 18, marginTop: 4 },
  primary: { minHeight: 58, paddingHorizontal: 20, borderRadius: 18, backgroundColor: colors.plum, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 'auto' }, primaryDisabled: { opacity: .35 }, primaryText: { color: colors.white, fontWeight: '800', fontSize: 16 }, primaryArrow: { position: 'absolute', right: 20, color: colors.white, fontSize: 22 }, primaryLight: { backgroundColor: colors.white }, primaryTextLight: { color: colors.plum },
  trailTop: { paddingTop: Platform.OS === 'web' ? 24 : 6, paddingHorizontal: 22, height: 65, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, close: { color: colors.white, fontSize: 36, fontWeight: '200' }, progress: { color: colors.white, fontWeight: '800', fontSize: 13 }, sound: { color: colors.white, fontSize: 20 }, progressTrack: { height: 3, marginHorizontal: 22, backgroundColor: 'rgba(255,255,255,.25)' }, progressFill: { height: 3, backgroundColor: colors.white }, sceneWrap: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center' }, sceneEyebrow: { color: 'rgba(255,255,255,.75)', fontSize: 11, fontWeight: '900', letterSpacing: 1.8 }, emoji: { fontSize: 84, marginVertical: 28 }, sceneTitle: { color: colors.white, fontWeight: '900', fontSize: 34, lineHeight: 38, textAlign: 'center', letterSpacing: -1 }, sceneStory: { color: '#F7EAF5', fontSize: 18, lineHeight: 27, textAlign: 'center', marginTop: 15, maxWidth: 430 }, anchorCard: { width: '100%', marginTop: 30, padding: 17, borderRadius: 17, backgroundColor: 'rgba(255,255,255,.13)', borderWidth: 1, borderColor: 'rgba(255,255,255,.25)' }, anchorLabel: { color: '#E3CAE5', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 }, anchor: { color: colors.white, fontSize: 15, lineHeight: 22, marginTop: 6, fontWeight: '700' }, bottomAction: { padding: 22, paddingBottom: 30 },
  routeDots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingTop: 14 }, routeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.3)' }, routeDotVisited: { backgroundColor: 'rgba(255,255,255,.65)' }, routeDotActive: { width: 22, backgroundColor: colors.white },
  recallCount: { color: colors.coral, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginTop: 35, marginBottom: 12 }, optionList: { marginTop: 30, gap: 11 }, option: { minHeight: 65, padding: 14, borderRadius: 18, borderWidth: 1.5, borderColor: '#D9D2CB', backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 13 }, optionSelected: { borderColor: colors.violet, backgroundColor: '#F3EBF8' }, optionCorrect: { borderColor: '#5D9A6B', backgroundColor: '#E5F2E8' }, optionKey: { width: 34, height: 34, borderRadius: 17, textAlign: 'center', paddingTop: Platform.OS === 'web' ? 8 : 7, backgroundColor: '#EEE9E4', fontWeight: '900', color: colors.ink }, optionText: { flex: 1, color: colors.ink, fontWeight: '700', fontSize: 15 }, feedback: { marginTop: 16, padding: 17, borderRadius: 17, backgroundColor: '#E9E0F0' }, feedbackTitle: { fontWeight: '900', color: colors.plum }, feedbackText: { color: colors.muted, marginTop: 5, lineHeight: 20 },
  paywall: { paddingHorizontal: 24, paddingBottom: 35, alignItems: 'stretch' }, orbit: { width: 100, height: 100, alignSelf: 'center', borderRadius: 50, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 24 }, orbitEmoji: { fontSize: 52 }, payTitle: { color: colors.ink, fontSize: 35, lineHeight: 39, fontWeight: '900', letterSpacing: -1.2, textAlign: 'center' }, benefits: { gap: 13, marginBottom: 22 }, benefit: { flexDirection: 'row', alignItems: 'center', gap: 12 }, check: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.mint, color: '#32623E', textAlign: 'center', paddingTop: 2, fontWeight: '900' }, benefitText: { color: colors.ink, fontWeight: '700' }, plan: { borderWidth: 2, borderColor: colors.plum, borderRadius: 19, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, marginBottom: 16 }, best: { color: colors.coral, fontSize: 9, fontWeight: '900', letterSpacing: 1.3 }, planName: { color: colors.ink, fontWeight: '900', fontSize: 16, marginTop: 4 }, planSub: { color: colors.muted, fontSize: 12, marginTop: 4 }, radio: { color: colors.plum, fontSize: 22 }, fine: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 13 },
  libraryPage: { paddingHorizontal: 24, paddingBottom: 34, flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', boxSizing: 'border-box' }, libraryTitle: { color: colors.ink, fontSize: 38, lineHeight: 42, fontWeight: '900', letterSpacing: -1.3, marginTop: 25 }, libraryList: { gap: 12, marginBottom: 24 }, libraryCard: { minHeight: 98, backgroundColor: colors.white, borderRadius: 20, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' }, libraryArt: { width: 88, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' }, libraryEmoji: { fontSize: 34 }, libraryBody: { flex: 1, minWidth: 0, padding: 15 }, libraryTopic: { color: colors.ink, fontWeight: '900', fontSize: 16 }, libraryMeta: { color: colors.muted, fontSize: 12, marginTop: 5 },
  mapPage: { paddingHorizontal: 24, paddingBottom: 36, flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', boxSizing: 'border-box' }, mapEyebrow: { color: colors.coral, fontSize: 10, fontWeight: '900', letterSpacing: 1.7, marginTop: 16 }, mapTitle: { color: colors.ink, fontSize: 34, lineHeight: 39, fontWeight: '900', letterSpacing: -1.2, marginTop: 7 }, mapIntro: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }, mapCard: { height: 350, borderRadius: 26, overflow: 'hidden', backgroundColor: '#EDE4F2', marginTop: 18, marginBottom: 14, position: 'relative' }, mapNode: { position: 'absolute', width: 58, height: 58, marginLeft: -29, marginTop: -29, borderRadius: 29, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.plum, shadowColor: colors.plum, shadowOpacity: .18, shadowRadius: 8, shadowOffset: { width: 0, height: 5 }, elevation: 4 }, mapNodeEmoji: { fontSize: 27 }, mapNodeNumber: { position: 'absolute', right: -3, top: -5, width: 19, height: 19, borderRadius: 10, color: colors.white, backgroundColor: colors.coral, textAlign: 'center', fontSize: 10, fontWeight: '900', paddingTop: 2 }, mapHint: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#FFF0D6', borderRadius: 16, padding: 14, marginBottom: 20 }, mapHintIcon: { color: colors.coral, fontSize: 21 }, mapHintText: { color: colors.ink, flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  resultPage: { paddingHorizontal: 24, paddingBottom: 36, flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center', boxSizing: 'border-box' }, resultEyebrow: { color: colors.coral, fontSize: 11, fontWeight: '900', letterSpacing: 1.8, marginTop: 26 }, resultScore: { color: colors.plum, fontSize: 72, lineHeight: 82, fontWeight: '900', letterSpacing: -4, marginTop: 8 }, resultTotal: { color: colors.muted, fontSize: 28, letterSpacing: -1 }, resultTitle: { color: colors.ink, fontSize: 33, lineHeight: 38, fontWeight: '900', letterSpacing: -1.2 }, traceCard: { backgroundColor: colors.white, borderRadius: 22, padding: 20, marginBottom: 24 }, traceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, traceLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }, traceValue: { color: colors.plum, fontSize: 18, fontWeight: '900' }, traceTrack: { height: 10, borderRadius: 5, backgroundColor: '#EDE8E2', overflow: 'hidden', marginTop: 16 }, traceFill: { height: 10, borderRadius: 5, backgroundColor: colors.coral }, traceTiming: { color: colors.ink, fontSize: 14, fontWeight: '800', marginTop: 14 }, resultHome: { color: colors.violet, textAlign: 'center', fontSize: 13, fontWeight: '800', marginTop: 16 },
});

const mapPoints = [{ left: '17%', top: 58 }, { left: '73%', top: 92 }, { left: '35%', top: 170 }, { left: '78%', top: 246 }, { left: '20%', top: 302 }] as const;
function TrailMap({ trail }: { trail: MemoryTrail }) { return <View style={styles.mapCard}><Svg width="100%" height="100%" viewBox="0 0 340 350"><Path d="M58 58 C130 35 205 116 248 92 S150 138 119 170 S220 206 265 246 S130 282 68 302" fill="none" stroke="#8659A6" strokeWidth="8" strokeLinecap="round" strokeDasharray="2 17" /><Circle cx="58" cy="58" r="46" fill="#DCC8F2" opacity=".45" /><Circle cx="265" cy="246" r="55" fill="#FFB7A7" opacity=".35" /></Svg>{trail.scenes.map((item, index) => <View key={item.place} style={[styles.mapNode, mapPoints[index]]} accessibilityLabel={`Stop ${index + 1}: ${item.place}`}><Text style={styles.mapNodeEmoji}>{item.emoji}</Text><Text style={styles.mapNodeNumber}>{index + 1}</Text></View>)}</View>; }
