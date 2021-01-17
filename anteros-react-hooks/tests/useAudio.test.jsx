import { renderHook } from '@testing-library/react-hooks';
import useAudio from '../src/hooks/useAudio';
const setUp = (
  src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  autoPlay = true
) => renderHook(() => useAudio({ src, autoPlay }));

it('deve init audio e utils', () => {
  global.console.error = jest.fn();

  const MOCK_AUDIO_SRC = 'MOCK_AUDIO_SRC';
  const MOCK_AUTO_PLAY_STATE = true;
  const { result } = setUp(MOCK_AUDIO_SRC, MOCK_AUTO_PLAY_STATE);
  const [audio, state, controls, ref] = result.current;

  // expect(global.console.error).toHaveBeenCalledTimes(1);

  // Teste o comp de áudio
  expect(audio.type).toBe('audio');
  expect(audio.props.src).toBe(MOCK_AUDIO_SRC);
  expect(audio.props.autoPlay).toBe(MOCK_AUTO_PLAY_STATE);

  // Valor do estado de teste
  expect(state.time).toBe(0);
  expect(state.paused).toBe(true);
  expect(state.muted).toBe(false);
  expect(state.volume).toBe(1);

  // Controles de teste
  ref.current = document.createElement('audio');
  // Corrente de referência simulada para teste de controles

  expect(ref.current.muted).toBe(false);
  controls.mute();
  expect(ref.current.muted).toBe(true);
  controls.unmute();
  expect(ref.current.muted).toBe(false);

  expect(ref.current.volume).toBe(1);
  controls.volume(0.5);
  expect(ref.current.volume).toBe(0.5);
});
