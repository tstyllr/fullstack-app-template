import concurrently from 'concurrently';

concurrently([
   {
      name: 'backend',
      command: 'bun run dev',
      cwd: 'backend',
      prefixColor: 'cyan',
   },
   {
      name: 'frontend',
      command: 'bun run web',
      cwd: 'frontend',
      prefixColor: 'green',
   },
]);
