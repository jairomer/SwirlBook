import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
//import 'bootstrap/dist/css/bootstrap.min.css';
//import StrudelRepl from './Strudel/strudel.jsx';
import MiniRepl from './strudel/MiniRepl';

function App() {
  const strudelCode = `
            // @date 23-08-15
            // "golf rolf" @by froos @license CC BY-NC-SA 4.0
            stack(
            setcps(1)
              s("bd*2, ~ rim*<1!3 2>, hh*4").bank('RolandTR909')
              .off(-1/8, set(speed("1.5").gain(.25)))
              .mask("<0!16 1!64>")
              ,
              note("g1(3,8)")
              .s("gm_synth_bass_2:<0 2>")
              .delay(".8:.25:.25")
              .clip("<.5!16 2!32>")
              .off(1/8, add(note("12?0.7")))
              .lpf(sine.range(500,2000).slow(32)).lpq(8)
              .add(note("0,.05"))
              .mask("<0!8 1!32>")
              ,
              n("<0 1 2 3 4>*8").scale('G4 minor')
              .s("gm_lead_6_voice")
              .clip(sine.range(.2,.8).slow(8))
              .jux(rev)
              .room(2)
              .sometimes(add(note("12")))
              .lpf(perlin.range(200,20000).slow(4))
            ).reset("<x@15 x(5,8)>")
          `
      //<StrudelRepl code={strudelCode} editable={false}/>
  return (
    <>
      <MiniRepl tune={strudelCode} />
    </>
  )
}

export default App
