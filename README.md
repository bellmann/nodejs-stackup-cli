# nodejs-stackup-cli

A very basic implementation of pcb-stackup as a CLI-tool.

Usage:

```
node index.js <gerbers.zip>
```

This generates two lines of output:

```
{ board_width: 2.3504, board_length: 1.5, board_layers: 0 }
All done.
```

And creates two `.svg`-files.
