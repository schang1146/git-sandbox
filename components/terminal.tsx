import { useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export default function DynamicTerminal() {
  const [isTerminalOpen, toggleTerminal] = useState(false);
  const [terminal, setTerminal] = useState(null);
  const [history, setHistory] = useState<string[]>([]);
  let currentLine = 1;
  let currentLineContent = '';
  const prefix = '\x1B[92mgit@sandbox\x1B[0m $ ';

  const openTerminal = (toggle: boolean) => {
    const terminalElement = document.getElementById('terminal');
    if (!toggle) {
      console.log(terminalElement);
    } else {
      const term = new Terminal({
        convertEol: true,
        cursorBlink: true,
        cursorStyle: 'bar',
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalElement!);
      // fitAddon.fit();
      term.write('\x1B[92mgit@sandbox\x1B[0m $ ');
      term.onKey((e) => {
        currentLineContent += e.key;
        term.write(e.key);
      });
      term.attachCustomKeyEventHandler((e) => {
        switch (e.key) {
          case 'Enter':
            if (e.type === 'keydown') {
              setHistory(history.concat([currentLineContent]));
              currentLine += Math.ceil((currentLineContent.length + prefix.replace(/[^\x00-\x7F]/g, '').length) / term.cols) + 1;
              currentLineContent = '';
              term.write('\r\n\r\n\x1B[92mgit@sandbox\x1B[0m $ ');
            }
            return false;
          case 'Backspace':
            if (e.type === 'keydown') {
              term.write(`\x1B[${currentLine}H`);
              if (currentLineContent) {
                currentLineContent = currentLineContent.slice(0, currentLineContent.length - 1);
                term.write('\x1B[J\r');
                term.write(`\x1B[92mgit@sandbox\x1B[0m $ ${currentLineContent}`);
              } else {
                term.write('\x1B[J\r');
                term.write('\x1B[92mgit@sandbox\x1B[0m $ ');
              }
            }
            return false;
          default:
            return true;
        }
      });
    }
    toggleTerminal(toggle);
  };

  return (
    <div>
      <button onClick={() => openTerminal(!isTerminalOpen)}>Open terminal</button>
      <div id='terminal' />
    </div>
  );
}
