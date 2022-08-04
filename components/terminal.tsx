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
    if (terminalRef.current?.childElementCount) {
      terminalRef.current?.removeChild(terminalRef.current.firstElementChild!);
    }
    console.log('Opening fresh terminal');
    term.open(terminalRef.current!);
    console.log(`Before fitting xTerm screen\nContainesr width: ${terminalRef.current?.clientWidth}\nCols: ${term.cols}`);
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
    currentLine += incrementLines(prefix + currentLineContent);

    const splitCmd = cmd.trim().split(' ');
    switch (splitCmd[0]) {
      case 'git':
        const gitText = "\
        \r\nusage: git [--help]\
        \r\n\
        \r\nThese are common Git commands used in various situations:\
        \r\n\
        \r\nstart a working area (see also: git help tutorial)\
        \r\n\
        \r\nwork on the current change (see also: git help everyday)\
        \r\n\
        \r\nexamine the history and state (see also: git help revisions)\
        \r\n\
        \r\ngrow, mark and tweak your common history\
        \r\n\
        \r\ncollaborate (see also: git help workflow)\
        \r\n\
        \r\n'git help -a' and 'git help -g' list available subcommands and some\
        \r\nconcept guides. See 'git help <command>' or 'git help <concept>'\
        \r\nto read about a specific subcommand or concept.\
        \r\nSee 'git help git' for an overview of the system.\
        \r\n\
        \r\n";
        term.write(gitText);
        currentLine += incrementLines(gitText);
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
