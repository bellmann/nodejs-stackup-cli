# nodejs-stackup-cli

A very basic implementation of pcb-stackup as a CLI-tool.

Usage:

```
node index.js <gerbers.zip>
```

This generates two lines of output:

```
{ board_width: '59.70', board_length: '38.10', board_layers: 2 }
All done.
```

And creates two `.svg`-files.
