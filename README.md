# color
A Javascript Color object
Color object
RGB Color with three 8-bit channels
Each instance expresses color in three different ways:
- Hexidecimal: A 6-character string
- FlatInteger: A 24-bit integer encoding three bytes
- RGB: r, g, and b are three separate properties, 1 byte each

valueOf() returns the FlatInteger representation.
toString() returns the hexidecimal representation.
toString('rgb') returns the rgb representation as a string.

This allows shortcuts like document.body.style.color = new Color('ff7700');
