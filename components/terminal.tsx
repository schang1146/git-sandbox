import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export default function DynamicTerminal() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
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
  fitAddon.fit();
  term.write('\x1B[92mgit@sandbox\x1B[0m $ ');
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

  useEffect(() => {
    if (!isTerminalOpen) {
      term.open(terminalRef.current!);
      setIsTerminalOpen(true);
    }
  }, []);

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
        currentLine += 2;
    }

    currentLineContent = '';
    term.write('\r\n\r\n\x1B[92mgit@sandbox\x1B[0m $ ');
    currentLine += Math.ceil((cmd.length + prefix.replace(/[^\x00-\x7F]/g, '').length) / term.cols) + 1;
  };

  const toggleTerminal = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  return (
    <div>
      <div id='terminal' ref={terminalRef} style={{ display: `${isTerminalOpen ? 'block' : 'none'}` }} />
      <button onClick={() => toggleTerminal()}>Toggle Terminal</button>
    </div>
  );
}
