const bcrypt = require('bcryptjs');

const pw = 'password123';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(pw, salt);

console.log('Hash:', hash);
console.log('Match:', bcrypt.compareSync(pw, hash));
