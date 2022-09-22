import { Terminal } from 'xterm';

const gitPrompts = {
  help: "\
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
    \r\n",
  notAvailable: "\
    \r\ngit: {} is not a git command. See 'git --help'.\
    \r\n\
    \r\n",
};

export default function execGitCmd(term: Terminal, subcommand: string): number {
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

  switch (subcommand) {
    case '--help':
    case 'help':
      term.write(gitPrompts.help);
      return incrementLines(gitPrompts.help);
    default:
      const hydratedNotAvailable = gitPrompts.notAvailable.replace('{}', `'${subcommand}'`);
      term.write(hydratedNotAvailable);
      return incrementLines(hydratedNotAvailable);
  }
}
