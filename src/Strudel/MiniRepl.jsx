import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Icon } from './icon';
import { silence, getPunchcardPainter, noteToMidi, _mod, evalScope, controls, register } from '@strudel/core';
import { transpiler } from '@strudel/transpiler';
import { getAudioContext, webaudioOutput, initAudioOnFirstClick } from '@strudel/webaudio';
import { StrudelMirror } from '@strudel/codemirror';
//import { prebake } from '@strudel/repl';
import prebake from './prebake';
import { persistentMap } from '@nanostores/persistent';
// import { loadModules } from '../repl/util.mjs';

function useClient() {
  const [client, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
  }, []);
  return client;
}

/** SETTINGS **/
const defaultSettings = {
  activeFooter: 'intro',
  keybindings: 'codemirror',
  isBracketMatchingEnabled: true,
  isLineNumbersDisplayed: true,
  isActiveLineHighlighted: true,
  isAutoCompletionEnabled: false,
  isTooltipEnabled: true,
  isFlashEnabled: true,
  isLineWrappingEnabled: false,
  isPatternHighlightingEnabled: true,
  theme: 'strudelTheme',
  fontFamily: 'monospace',
  fontSize: 18,
  latestCode: '',
  isZen: false,
  soundsFilter: 'all',
  patternFilter: 'community',
  panelPosition: 'right',
  userPatterns: '{}',
  audioDeviceName: 'System Standard',
};

const settingsMap = persistentMap('strudel-settings', defaultSettings);
function useSettings() {
  const state = useStore(settingsMap);

  const userPatterns = JSON.parse(state.userPatterns);
  Object.keys(userPatterns).forEach((key) => {
    const data = userPatterns[key];
    data.id = data.id ?? key;
    userPatterns[key] = data;
  });
  return {
    ...state,
    isZen: [true, 'true'].includes(state.isZen) ? true : false,
    isBracketMatchingEnabled: [true, 'true'].includes(state.isBracketMatchingEnabled) ? true : false,
    isLineNumbersDisplayed: [true, 'true'].includes(state.isLineNumbersDisplayed) ? true : false,
    isActiveLineHighlighted: [true, 'true'].includes(state.isActiveLineHighlighted) ? true : false,
    isAutoCompletionEnabled: [true, 'true'].includes(state.isAutoCompletionEnabled) ? true : false,
    isPatternHighlightingEnabled: [true, 'true'].includes(state.isPatternHighlightingEnabled) ? true : false,
    isTooltipEnabled: [true, 'true'].includes(state.isTooltipEnabled) ? true : false,
    isLineWrappingEnabled: [true, 'true'].includes(state.isLineWrappingEnabled) ? true : false,
    isFlashEnabled: [true, 'true'].includes(state.isFlashEnabled) ? true : false,
    fontSize: Number(state.fontSize),
    panelPosition: state.activeFooter !== '' ? state.panelPosition : 'bottom', // <-- keep this 'bottom' where it is!
    userPatterns: userPatterns,
  };
}

const patternSetting = (key) =>
  register(key, (value, pat) =>
    pat.onTrigger(() => {
      value = Array.isArray(value) ? value.join(' ') : value;
      if (value !== settingsMap.get()[key]) {
        settingsMap.setKey(key, value);
      }
      return pat;
    }, false),
  );

const theme = patternSetting('theme');
const fontFamily = patternSetting('fontFamily');
const fontSize = patternSetting('fontSize');
const settingPatterns = { theme, fontFamily, fontSize };

/** End Of Settings **/

function loadModules() {
  let modules = [
    import('@strudel/core'),
    import('@strudel/tonal'),
    import('@strudel/mini'),
    import('@strudel/xen'),
    import('@strudel/webaudio'),
    import('@strudel/codemirror'),
    import('@strudel/hydra'),
    import('@strudel/serial'),
    import('@strudel/soundfonts'),
    import('@strudel/csound'),
    import('@strudel/midi'),
    import('@strudel/osc')
  ];

  return evalScope(
    controls, // sadly, this cannot be exported from core direclty
    settingPatterns,
    ...modules,
  );
}

let prebaked, modulesLoading, audioLoading;
if (typeof window !== 'undefined') {
  prebaked = prebake();
  modulesLoading = loadModules();
  audioLoading = initAudioOnFirstClick();
}

export default function MiniRepl({
  tune,
  tunes,
  hideHeader = false,
  canvasHeight = 100,
  onTrigger,
  maxHeight,
}) {
  const code = tunes ? tunes[0] : tune;
  const id = useMemo(() => s4(), []);
  const canvasId = useMemo(() => `canvas-${id}`, [id]);
  const shouldDraw = true; 
  const shouldShowCanvas = false; 
  const drawTime = false; 
  const [activeNotes, setActiveNotes] = useState([]);

  const init = useCallback(({ code, shouldDraw }) => {
    const drawContext = shouldDraw ? document.querySelector('#' + canvasId)?.getContext('2d') : null;
    let onDraw;

    const editor = new StrudelMirror({
      id,
      defaultOutput: webaudioOutput,
      getTime: () => getAudioContext().currentTime,
      transpiler,
      autodraw: !!shouldDraw,
      root: containerRef.current,
      initialCode: '// LOADING',
      pattern: silence,
      drawTime,
      onDraw,
      editPattern: (pat, id) => {
        if (onTrigger) {
          pat = pat.onTrigger(onTrigger, false);
        }
        return pat;
      },
      prebake: async () => Promise.all([modulesLoading, prebaked, audioLoading]),
      onUpdateState: (state) => {
        setReplState({ ...state });
      },
    });
    // init settings
    editor.setCode(code);
    editorRef.current = editor;
  }, []);

  const [replState, setReplState] = useState({});
  const { started, isDirty, error } = replState;
  const editorRef = useRef();
  const containerRef = useRef();
  const client = useClient();

  const [tuneIndex, setTuneIndex] = useState(0);
  const changeTune = (index) => {
    index = _mod(index, tunes.length);
    setTuneIndex(index);
    editorRef.current?.setCode(tunes[index]);
    editorRef.current?.evaluate();
  };

  if (!client) {
    return <pre>{code}</pre>;
  }

  return (
    <div className="overflow-hidden rounded-t-md bg-background border border-lineHighlight">
      {!hideHeader && (
        <div className="flex justify-between bg-lineHighlight">
          <div className="flex">
            <button
              className={cx(
                'cursor-pointer w-16 flex items-center justify-center p-1 border-r border-lineHighlight text-foreground bg-lineHighlight hover:bg-background',
                started ? 'animate-pulse' : '',
              )}
              onClick={() => editorRef.current?.toggle()}
            >
              <Icon type={started ? 'stop' : 'play'} />
            </button>
            <button
              className={cx(
                'w-16 flex items-center justify-center p-1 text-foreground border-lineHighlight bg-lineHighlight',
                isDirty ? 'text-foreground hover:bg-background cursor-pointer' : 'opacity-50 cursor-not-allowed',
              )}
              onClick={() => editorRef.current?.evaluate()}
            >
              <Icon type="refresh" />
            </button>
          </div>
          {tunes && (
            <div className="flex">
              <button
                className={
                  'cursor-pointer w-16 flex items-center justify-center p-1 border-r border-lineHighlight text-foreground bg-lineHighlight hover:bg-background'
                }
                onClick={() => changeTune(tuneIndex - 1)}
              >
                <div className="rotate-180">
                  <Icon type="skip" />
                </div>
              </button>
              <button
                className={
                  'cursor-pointer w-16 flex items-center justify-center p-1 border-r border-lineHighlight text-foreground bg-lineHighlight hover:bg-background'
                }
                onClick={() => changeTune(tuneIndex + 1)}
              >
                <Icon type="skip" />
              </button>
            </div>
          )}
        </div>
      )}
      <div className="overflow-auto relative p-1" style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}>
        <div
          ref={(el) => {
            if (!editorRef.current) {
              containerRef.current = el;
              init({ code, shouldDraw });
            }
          }}
        ></div>
        {error && <div className="text-right p-1 text-md text-red-200">{error.message}</div>}
      </div>
      {shouldShowCanvas && (
        <canvas
          id={canvasId}
          className="w-full pointer-events-none border-t border-lineHighlight"
          height={canvasHeight}
          ref={(el) => {
            if (el && el.width !== el.clientWidth) {
              el.width = el.clientWidth;
            }
          }}
        ></canvas>
      )}
      {
        /* !!log.length && (
      <div className="bg-gray-800 rounded-md p-2">
        {log.map(({ message }, i) => (
          <div key={i}>{message}</div>
        ))}
      </div>
    ) */}
    </div>
  );
}

function cx(...classes) {
  // : Array<string | undefined>
  return classes.filter(Boolean).join(' ');
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
