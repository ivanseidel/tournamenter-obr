const countBy = (list, iteratee) => {
  if (typeof iteratee !== 'function') {
    const iterateeRef = iteratee;
    iteratee = value => value[iterateeRef];
  }

  return list.reduce((accumulator, current, index) => {
    index = iteratee(current);
    if (accumulator.hasOwnProperty(index)) {
      ++accumulator[index];
    } else {
      accumulator[index] = 1;
    }
    return accumulator;
  }, {});
};

const pick = (object, ...whitelist) => {
  const obj = {};

  whitelist.flat(Infinity).map(whiteitem => {
    obj[whiteitem] = object[whiteitem];
  });

  return obj;
};

const without = (array, ...values) => {
  return array.filter(value => values.flat(Infinity).includes(value));
};

const throttle = (func, timeFrame) => {
  let lastTime = 0;
  return () => {
    const now = new Date();
    if (now - lastTime >= timeFrame) {
      func();
      lastTime = now;
    }
  };
};

module.exports = {
  countBy,
  pick,
  without,
  throttle,
};
