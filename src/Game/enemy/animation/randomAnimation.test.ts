import {arenaSize, craftSize} from 'Game/gameConstants';
import randomAnimation from './randomAnimation';

describe(randomAnimation.name, () => {
  for (let i = 0; i < arenaSize - craftSize; i += 2) {
    it(`at top of ${i} and left of 0, returns a value in range`, () => {
      const {toValue} = randomAnimation({left: 0, top: i});
      expect(toValue).toBeLessThanOrEqual(arenaSize - craftSize);
    });

    it(`at left of ${i} and top of 0, returns a value in range`, () => {
      const {toValue} = randomAnimation({left: i, top: 0});
      expect(toValue).toBeLessThanOrEqual(arenaSize - craftSize);
    });
  }
});
