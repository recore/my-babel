
function assert(value, message) {
  if (!value) fail(value, true, message, '==', ok);
}
export default assert;

export function fail(actual) {
  throw new Error(actual);
}

assert.fail = fail;
