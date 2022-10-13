import { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import execGitCmd from '../commands/git';

export default function DynamicTerminal() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  let history: string[] = [];
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
    if (terminalRef.current?.childElementCount) {
      terminalRef.current?.removeChild(terminalRef.current.firstElementChild!);
    }
    console.log('Opening fresh terminal');
    term.open(terminalRef.current!);
    console.log(`Before fitting xTerm screen\nContainesr width: ${terminalRef.current?.clientWidth}\nCols: ${term.cols}`);
    fitAddon.fit();
    console.log(`After fitting xTerm screen\nContainer width: ${terminalRef.current?.clientWidth}\nCols: ${term.cols}`);
    term.onKey((e) => {
      console.log(`term.onKey e: ${e.domEvent.type}`);
      currentLineContent += e.key;
      switch (e.domEvent.key) {
        case 'ArrowUp':
          term.write(history[history.length - 1]);
          break;
        default:
          term.write(e.key);
      }
    });
    term.attachCustomKeyEventHandler((e) => {
      // console.log(`term.attachCustomKeyEventHandler e: ${e}`);
      switch (e.key) {
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
        case 'Enter':
          if (e.type === 'keydown') {
            execCommand(currentLineContent);
          }
          return false;
        default:
          return true;
      }
    });
    term.write(prefix);
  }, [terminalRef]);

  const execCommand = (cmd: string) => {
    history.push(cmd);
    currentLine += incrementLines(prefix + currentLineContent);

    const splitCmd = cmd.trim().split(' ');
    switch (splitCmd[0]) {
      case 'git':
        currentLine += execGitCmd(term, splitCmd.length > 1 ? splitCmd[1] : 'help');
        break;
      case 'help':
        const helpText = '\
        \r\nWelcome to Git Sandbox! Try some of the commands below.\
        \r\n\
        \r\nhelp   Prints this help message\
        \r\ngit    Simulate git commands\
        \r\n\
        \r\n';
        term.write(helpText);
        currentLine += incrementLines(helpText);
        break;
      case '':
        const blankText = '\r\n\r\n';
        term.write(blankText);
        currentLine += incrementLines(blankText);
        break;
      default:
        const notFoundText = `\
        \r\n${splitCmd[0]}: command not found\
        \r\n\
        \r\n`;
        term.write(notFoundText);
        currentLine += incrementLines(notFoundText);
    }

    currentLineContent = '';
    term.write(`${prefix}`);
  };

  const incrementLines = (text: string): number => {
    let linesToAdd = 0;
    const splitText = text.split('\r\n');
    for (const lineText of splitText) {
      const parsedLineText = lineText.replace(/[^\x00-\x7F]/g, '');
      linesToAdd += Math.floor(parsedLineText.length / term.cols);
    }
    linesToAdd += splitText.length - 1;
    return linesToAdd;
  };

  const toggleTerminal = () => {
    setIsTerminalOpen(!isTerminalOpen);
  };

  return (
    <div style={{ width: '900px', height: '600px' }}>
      <div id='terminal' ref={terminalRef} style={{ width: 'inherit', height: 'inherit', display: `${isTerminalOpen ? 'block' : 'none'}` }} />
      {/* <button onClick={() => toggleTerminal()}>Toggle Terminal</button> */}
    </div>
  );
}
