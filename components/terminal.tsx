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
    console.log(`Before fitting xTerm screen\nContainer width: ${terminalRef.current?.clientWidth}\nCols: ${term.cols}`);
    fitAddon.fit();
    console.log(`After fitting xTerm screen\nContainer width: ${terminalRef.current?.clientWidth}\nCols: ${term.cols}`);
    term.onKey((e) => {
      currentLineContent += e.key;
      term.write(e.key);
    });
    term.attachCustomKeyEventHandler((e) => {
      switch (e.key) {
        case 'Enter':
          if (e.type === 'keydown') {
            incrementLines(prefix + currentLineContent);
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

    const splitCmd = cmd.split(' ');
    switch (splitCmd[0]) {
      case 'help':
        const helpText = '\
        \r\nWelcome to Git Sandbox! Try some of the commands below.\
        \r\n\
        \r\nhelp   Prints this help message\
        \r\ngit    Simulate git commands';
        term.write(helpText);
        currentLine += incrementLines(helpText);
        break;
      default:
        const notFoundText = `${splitCmd[0]}: command not found`;
        term.write(`\r\n${notFoundText}`);
        currentLine += incrementLines(currentLineContent);
    }

    currentLineContent = '';
    term.write(`\r\n\r\n${prefix}`);
    currentLine += Math.ceil((cmd.length + prefix.replace(/[^\x00-\x7F]/g, '').length) / term.cols);
  };

  const incrementLines = (text: string): number => {
    let linesToAdd = 0;
    const splitText = text.split('\r\n');
    for (const lineText of splitText) {
      const parsedLineText = lineText.replace(/[^\x00-\x7F]/g, '');
      linesToAdd += Math.ceil(parsedLineText.length / term.cols);
    }
    console.log(`incrementLines:\ntext: ${text}\nlines added: ${linesToAdd}`);
    return linesToAdd;
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
