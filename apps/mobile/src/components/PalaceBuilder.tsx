import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, type PanResponderGestureState, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { MemoryTrail } from '../domain/trails';

export const palaceLandmarks = [
  { id: 'door', label: 'The velvet door', x: .16, y: 142, icon: '🚪' },
  { id: 'window', label: 'The moonlit window', x: .49, y: 98, icon: '🌙' },
  { id: 'shelf', label: 'The story shelf', x: .84, y: 142, icon: '📚' },
  { id: 'desk', label: 'The map desk', x: .29, y: 282, icon: '🗺️' },
  { id: 'statue', label: 'The marble statue', x: .74, y: 287, icon: '🗿' },
] as const;

type Props = {
  trail: MemoryTrail;
  onComplete: (places: string[]) => void;
};

const roomHeight = 410;

export function PalaceBuilder({ trail, onComplete }: Props) {
  const initial = useMemo(() => trail.scenes.map(scene => palaceLandmarks.findIndex(item => item.label === scene.palacePlace)), [trail]);
  const [assignments, setAssignments] = useState<Array<number | null>>(() => initial.map(index => index >= 0 ? index : null));
  const [roomWidth, setRoomWidth] = useState(340);
  const drag = useRef(new Animated.ValueXY()).current;
  const activeScene = assignments.findIndex(item => item === null);
  const complete = activeScene === -1;
  const used = new Set(assignments.filter((item): item is number => item !== null));
  const tokenStart = { x: roomWidth / 2 - 55, y: 330 };

  const assign = (landmarkIndex: number) => {
    if (activeScene < 0 || used.has(landmarkIndex)) return;
    setAssignments(current => current.map((value, index) => index === activeScene ? landmarkIndex : value));
    drag.setValue({ x: 0, y: 0 });
  };

  useEffect(() => { drag.setValue({ x: 0, y: 0 }); }, [activeScene, drag]);

  const responder = useMemo(() => {
    const finishDrag = (gesture: PanResponderGestureState) => {
      const center = { x: tokenStart.x + 55 + gesture.dx, y: tokenStart.y + 34 + gesture.dy };
      const candidates = palaceLandmarks
        .map((landmark, index) => ({ index, distance: Math.hypot(center.x - landmark.x * roomWidth, center.y - landmark.y) }))
        .filter(candidate => !used.has(candidate.index))
        .sort((a, b) => a.distance - b.distance);
      if (candidates[0] && candidates[0].distance < 82) assign(candidates[0].index);
      else Animated.spring(drag, { toValue: { x: 0, y: 0 }, useNativeDriver: false, tension: 90, friction: 9 }).start();
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => activeScene >= 0,
      onMoveShouldSetPanResponder: (_, gesture) => activeScene >= 0 && Math.abs(gesture.dx) + Math.abs(gesture.dy) > 4,
      onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => finishDrag(gesture),
      onPanResponderTerminate: (_, gesture) => finishDrag(gesture),
      onShouldBlockNativeResponder: () => true,
    });
  }, [activeScene, assignments, roomWidth]);

  const undo = () => {
    const last = assignments.reduce<number>((found, value, index) => value !== null ? index : found, -1);
    if (last >= 0) setAssignments(current => current.map((value, index) => index === last ? null : value));
  };

  return <View>
    <View style={styles.progressRow}><Text style={styles.progressLabel}>{complete ? 'PALACE READY' : `PLACE ${activeScene + 1} OF ${trail.scenes.length}`}</Text><Text style={styles.progressValue}>{assignments.filter(item => item !== null).length} / 5</Text></View>
    <View style={styles.room} onLayout={event => setRoomWidth(event.nativeEvent.layout.width)}>
      <LinearGradient colors={['#EEE1F2', '#D7C1DE']} style={styles.wall} />
      <View style={styles.ceilingLine} />
      <View style={styles.floor}><View style={styles.floorLineOne} /><View style={styles.floorLineTwo} /><View style={styles.floorLineThree} /></View>
      <View style={styles.rug} />

      {palaceLandmarks.map((landmark, landmarkIndex) => {
        const sceneIndex = assignments.findIndex(item => item === landmarkIndex);
        const isUsed = sceneIndex >= 0;
        return <Pressable
          key={landmark.id}
          accessibilityRole="button"
          accessibilityLabel={`${landmark.label}${isUsed ? `, holding ${trail.scenes[sceneIndex].title}` : ', empty'}`}
          onPress={() => assign(landmarkIndex)}
          style={[styles.landmark, { left: `${landmark.x * 100}%`, top: landmark.y }, isUsed && styles.landmarkUsed]}
        >
          <LandmarkVisual id={landmark.id} icon={landmark.icon} />
          <Text style={styles.landmarkLabel}>{landmark.label.replace('The ', '')}</Text>
          {isUsed && <View style={styles.placedObject}><Text style={styles.placedEmoji}>{trail.scenes[sceneIndex].emoji}</Text><Text numberOfLines={1} style={styles.placedTitle}>{trail.scenes[sceneIndex].title}</Text></View>}
          {!isUsed && activeScene >= 0 && <View style={styles.dropHalo}><Text style={styles.dropPlus}>＋</Text></View>}
        </Pressable>;
      })}

      {activeScene >= 0 && <Animated.View
        accessibilityLabel={`Drag ${trail.scenes[activeScene].title} to a landmark`}
        {...responder.panHandlers}
        style={[styles.memoryToken, { left: tokenStart.x, top: tokenStart.y, transform: drag.getTranslateTransform() }]}
      ><Text style={styles.tokenEmoji}>{trail.scenes[activeScene].emoji}</Text><Text numberOfLines={2} style={styles.tokenTitle}>{trail.scenes[activeScene].title}</Text><Text style={styles.grip}>•••</Text></Animated.View>}
    </View>

    <View style={styles.instructionCard}>
      <Text style={styles.instructionIcon}>{complete ? '✓' : '↕'}</Text>
      <View style={styles.instructionCopy}><Text style={styles.instructionTitle}>{complete ? 'Your ideas have a home.' : `Place “${trail.scenes[activeScene].title}”`}</Text><Text style={styles.instructionText}>{complete ? 'Revisit these same landmarks during recall.' : 'Drag the memory object into the room, or tap an empty landmark.'}</Text></View>
    </View>

    <View style={styles.actions}>
      <Pressable disabled={!assignments.some(item => item !== null)} onPress={undo}><Text style={[styles.actionText, !assignments.some(item => item !== null) && styles.actionDisabled]}>Undo</Text></Pressable>
      <Pressable disabled={!assignments.some(item => item !== null)} onPress={() => setAssignments(trail.scenes.map(() => null))}><Text style={[styles.actionText, !assignments.some(item => item !== null) && styles.actionDisabled]}>Reset room</Text></Pressable>
    </View>

    <Pressable accessibilityRole="button" disabled={!complete} onPress={() => onComplete(assignments.map(index => palaceLandmarks[index!].label))} style={[styles.primary, !complete && styles.primaryDisabled]}><Text style={styles.primaryText}>{complete ? 'Enter my palace' : `Place ${5 - assignments.filter(item => item !== null).length} more memories`}</Text><Text style={styles.primaryArrow}>→</Text></Pressable>
  </View>;
}

function LandmarkVisual({ id, icon }: { id: string; icon: string }) {
  if (id === 'door') return <View style={styles.door}><View style={styles.doorInset}><Text style={styles.objectIcon}>{icon}</Text></View></View>;
  if (id === 'window') return <View style={styles.window}><View style={styles.windowCrossV} /><View style={styles.windowCrossH} /><Text style={styles.objectIcon}>{icon}</Text></View>;
  if (id === 'shelf') return <View style={styles.shelf}><View style={styles.shelfLine} /><View style={[styles.shelfLine, { top: 48 }]} /><Text style={styles.objectIcon}>{icon}</Text></View>;
  if (id === 'desk') return <View style={styles.desk}><Text style={styles.objectIcon}>{icon}</Text><View style={styles.deskLegLeft} /><View style={styles.deskLegRight} /></View>;
  return <View style={styles.statue}><Text style={styles.objectIcon}>{icon}</Text><View style={styles.pedestal} /></View>;
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 },
  progressLabel: { color: '#FF7657', fontSize: 10, fontWeight: '900', letterSpacing: 1.7 }, progressValue: { color: '#542B66', fontWeight: '900', fontSize: 12 },
  room: { height: roomHeight, borderRadius: 28, overflow: 'hidden', position: 'relative', backgroundColor: '#D9C4E0', borderWidth: 1, borderColor: '#CCB5D4', shadowColor: '#542B66', shadowOpacity: .18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  wall: { position: 'absolute', left: 0, right: 0, top: 0, height: 292 }, ceilingLine: { position: 'absolute', left: 18, right: 18, top: 20, height: 2, backgroundColor: 'rgba(84,43,102,.12)' },
  floor: { position: 'absolute', left: -55, right: -55, bottom: -50, height: 180, backgroundColor: '#B98978', transform: [{ perspective: 380 }, { rotateX: '54deg' }] },
  floorLineOne: { position: 'absolute', left: '25%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(68,35,45,.16)', transform: [{ rotateZ: '10deg' }] }, floorLineTwo: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(68,35,45,.16)' }, floorLineThree: { position: 'absolute', left: '75%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(68,35,45,.16)', transform: [{ rotateZ: '-10deg' }] },
  rug: { position: 'absolute', width: 160, height: 52, left: '50%', marginLeft: -80, bottom: 8, borderRadius: 80, backgroundColor: 'rgba(84,43,102,.32)', transform: [{ scaleY: .55 }] },
  landmark: { position: 'absolute', width: 94, minHeight: 100, marginLeft: -47, marginTop: -55, alignItems: 'center', justifyContent: 'flex-end', zIndex: 3 }, landmarkUsed: { zIndex: 7 },
  landmarkLabel: { marginTop: 5, color: '#3D2944', fontSize: 9, fontWeight: '900', backgroundColor: 'rgba(247,244,236,.88)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, overflow: 'hidden' },
  door: { width: 58, height: 84, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 5, borderColor: '#75405F', backgroundColor: '#9B5B72', padding: 5 }, doorInset: { flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: '#C88AA0', alignItems: 'center', justifyContent: 'center' },
  window: { width: 72, height: 64, borderTopLeftRadius: 36, borderTopRightRadius: 36, borderWidth: 5, borderColor: '#F5EEE1', backgroundColor: '#543D72', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, windowCrossV: { position: 'absolute', width: 3, height: '100%', backgroundColor: '#F5EEE1' }, windowCrossH: { position: 'absolute', height: 3, width: '100%', backgroundColor: '#F5EEE1' },
  shelf: { width: 61, height: 90, borderWidth: 5, borderColor: '#70483B', backgroundColor: '#A76E51', alignItems: 'center', justifyContent: 'center' }, shelfLine: { position: 'absolute', left: 0, right: 0, top: 24, height: 4, backgroundColor: '#70483B' },
  desk: { width: 86, height: 45, borderRadius: 4, borderWidth: 4, borderColor: '#6D4538', backgroundColor: '#A66D50', alignItems: 'center', justifyContent: 'center' }, deskLegLeft: { position: 'absolute', left: 7, top: 40, width: 6, height: 25, backgroundColor: '#6D4538' }, deskLegRight: { position: 'absolute', right: 7, top: 40, width: 6, height: 25, backgroundColor: '#6D4538' },
  statue: { width: 62, height: 76, alignItems: 'center', justifyContent: 'flex-start' }, pedestal: { position: 'absolute', bottom: 0, width: 54, height: 34, backgroundColor: '#E8E1DB', borderWidth: 3, borderColor: '#C7BDB6', borderTopLeftRadius: 4, borderTopRightRadius: 4 }, objectIcon: { fontSize: 25, zIndex: 2 },
  dropHalo: { position: 'absolute', width: 43, height: 43, borderRadius: 22, borderWidth: 2, borderStyle: 'dashed', borderColor: '#FF7657', backgroundColor: 'rgba(255,255,255,.86)', alignItems: 'center', justifyContent: 'center', top: 22 }, dropPlus: { color: '#FF7657', fontSize: 24, fontWeight: '600' },
  placedObject: { position: 'absolute', top: 15, width: 76, minHeight: 53, borderRadius: 15, borderWidth: 2, borderColor: '#542B66', backgroundColor: '#FFF8EC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, shadowColor: '#542B66', shadowOpacity: .22, shadowRadius: 7 }, placedEmoji: { fontSize: 23 }, placedTitle: { color: '#542B66', fontWeight: '900', fontSize: 7, maxWidth: 66 },
  memoryToken: { position: 'absolute', width: 110, height: 68, zIndex: 30, borderRadius: 19, borderWidth: 3, borderColor: '#FF7657', backgroundColor: '#FFF9EE', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, shadowColor: '#542B66', shadowOpacity: .3, shadowRadius: 10, shadowOffset: { width: 0, height: 7 } }, tokenEmoji: { fontSize: 28 }, tokenTitle: { flex: 1, color: '#2B2030', fontWeight: '900', fontSize: 9, lineHeight: 11 }, grip: { position: 'absolute', bottom: 2, alignSelf: 'center', left: 44, color: '#A99CA8', fontSize: 11, letterSpacing: 2 },
  instructionCard: { marginTop: 15, borderRadius: 18, padding: 14, backgroundColor: '#FFF0D6', flexDirection: 'row', alignItems: 'center', gap: 12 }, instructionIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FF7657', color: '#FFFFFF', textAlign: 'center', paddingTop: 7, fontSize: 15, fontWeight: '900' }, instructionCopy: { flex: 1 }, instructionTitle: { color: '#171828', fontSize: 13, fontWeight: '900' }, instructionText: { color: '#727180', fontSize: 11, lineHeight: 15, marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 13, marginBottom: 15 }, actionText: { color: '#8659A6', fontSize: 12, fontWeight: '800' }, actionDisabled: { opacity: .3 },
  primary: { minHeight: 58, paddingHorizontal: 20, borderRadius: 18, backgroundColor: '#542B66', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, primaryDisabled: { opacity: .35 }, primaryText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 }, primaryArrow: { position: 'absolute', right: 20, color: '#FFFFFF', fontSize: 22 },
});
