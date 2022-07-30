import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export default function DynamicTerminal() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  let currentLine = 1;
  let currentLineContent = '';
  const prefix = '\x1B[92mgit@sandbox\x1B[0m $ ';
  const term = new Terminal({
    convertEol: true,
    cursorBlink: true,
    cursorStyle: 'bar',
  });
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);

  useEffect(() => {
    term.open(terminalRef.current!);
    fitAddon.fit();
    term.onKey((e) => {
      currentLineContent += e.key;
      term.write(e.key);
    });
    term.attachCustomKeyEventHandler((e) => {
      switch (e.key) {
        case 'Enter':
          if (e.type === 'keydown') {
            execCommand(currentLineContent);
          }
          return false;
        case 'Backspace':
          if (e.type === 'keydown') {
            term.write(`\x1B[${currentLine}H`); // moves to beginning of currentLine
            term.write('\x1B[J\r'); // erases everything to the right
            if (currentLineContent) {
              currentLineContent = currentLineContent.slice(0, currentLineContent.length - 1);
            }
            term.write(`${prefix}${currentLineContent}`);
          }
          return false;
        default:
          return true;
      }
    });
    term.write(prefix);
  }, [terminalRef]);

  const execCommand = (cmd: string) => {
    setHistory(history.concat([cmd]));

    const parsedCmd = cmd.split(' ');
    switch (parsedCmd[0]) {
      case 'help':
        term.write('\
        \r\nWelcome to Git Sandbox! Try some of the commands below.\
        \r\n\
        \r\nhelp   Prints this help message\
        \r\ngit    Simulate git commands\
        ');
        currentLine += 4;
        break;
      default:
        term.write(`\r\n${parsedCmd[0]}: command not found`);
        currentLine += 1; // TODO: add correct # of lines if cmd is multi-line
    }

    currentLineContent = '';
    term.write(`\r\n\r\n${prefix}`);
    currentLine += Math.ceil((cmd.length + prefix.replace(/[^\x00-\x7F]/g, '').length) / term.cols) + 1;
  };

  const toggleTerminal = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  return (
    <div style={{ width: '900px', height: '600px' }}>
      <div id='terminal' ref={terminalRef} style={{ display: `${isTerminalOpen ? 'block' : 'none'}` }} />
      {/* <button onClick={() => toggleTerminal()}>Toggle Terminal</button> */}
    </div>
  );
}
