const flatArray = array => {
  return array.reduce((flat, i) => {
    if (Array.isArray(i)) {
      return flat.concat(flatArray(i));
    }
    return flat.concat(i);
  }, []);
};

const countBy = (list, iteratee) => {
  if (typeof iteratee !== 'function') {
    const iterateeRef = iteratee;
    iteratee = value => value[iterateeRef];
  }

  return list.reduce((accumulator, current, index) => {
    index = iteratee(current);
    if (Object.prototype.hasOwnProperty.call(accumulator, index)) {
      ++accumulator[index];
    } else {
      accumulator[index] = 1;
    }
    return accumulator;
  }, {});
};

const pick = (object, ...whitelist) => {
  const obj = {};

  flatArray(whitelist).map(whiteitem => {
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

export { flatArray, countBy, pick, without, throttle };
