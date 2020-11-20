import { Field } from './index';
import { convertCoordinate } from './index';

describe('Field', () => {
  let field: Field;
  let fakeField: { size: number; cells: Array<Array<number>> };

  beforeEach(() => {
    field = new Field(10);
    fakeField = { size: 10, cells: [] };
    field.setCells.call(fakeField);
  });

  describe('getCells', () => {
    test('существует', () => {
      expect(field.getCells).toBeDefined();
      expect(typeof field.getCells).toBe('function');
    });

    test('возвращает копию массива', () => {
      expect(field.getCells.call(fakeField)).toEqual(fakeField.cells);
      expect(field.getCells.call(fakeField)).not.toBe(fakeField.cells);
      field.getCells.call(fakeField).forEach((row, index) => {
        expect(row).not.toBe(fakeField.cells[index]);
      });
    });
  });

  describe('getCoordinatesAround', () => {
    test('существует', () => {
      expect(field.getCoordinatesAround).toBeDefined();
      expect(typeof field.getCoordinatesAround).toBe('function');
    });

    test('возвращает корректные координаты', () => {
      [
        {
          center: { x: 0, y: 0 },
          around: [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
          ],
        },
        {
          center: { x: 1, y: 0 },
          around: [
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 0 },
          ],
        },
        {
          center: { x: 1, y: 1 },
          around: [
            { x: 1, y: 0 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 0, y: 1 },
          ],
        },
        {
          center: { x: 0, y: 1 },
          around: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 2 },
          ],
        },
      ].forEach(({ center, around }) => {
        expect(field.getCoordinatesAround(center).length).toBe(around.length);
        expect(field.getCoordinatesAround(center)).toEqual(
          expect.arrayContaining(around)
        );
      });
    });
  });

  describe('getPath', () => {
    test('существует', () => {
      expect(field.getPath).toBeDefined();
      expect(typeof field.getPath).toBe('function');
    });

    test('возвращает корректные пути', () => {
      [
        {
          barriers: [{ x: 1, y: 0 }],
          path: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
          equal: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
          ],
        },
        {
          barriers: [{ x: 0, y: 1 }],
          path: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
          equal: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
          ],
        },
        {
          barriers: [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
          ],
          path: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
          equal: [],
        },
      ].forEach(({ barriers, path, equal }) => {
        expect(
          new Field(2).setBarriers(barriers).getPath(path[0], path[1])
        ).toEqual(equal);
      });
    });
  });

  describe('getSize', () => {
    test('существует', () => {
      expect(field.getSize).toBeDefined();
      expect(typeof field.getSize).toBe('function');
    });

    test('возвращает корректный размер', () => {
      const size = Math.floor(Math.random() * 10);

      expect(new Field(size).getSize()).toBe(size);
    });
  });

  describe('setBarriers', () => {
    test('существует', () => {
      expect(field.setBarriers).toBeDefined();
      expect(typeof field.setBarriers).toBe('function');
    });

    test('возвращает this', () => {
      expect(field.setBarriers([])).toBe(field);
    });

    test('заполняет двумерный массив -1', () => {
      const coordinates = Array.from({ length: 10 }, (row, y) =>
        Array.from({ length: 10 }, (cell, x) => ({ x, y }))
      ).reduce((result, row) => result.concat(row), []);

      field.setBarriers(coordinates);
      expect(
        field.getCells().every((row) => row.every((cell) => cell === -1))
      ).toBe(true);
    });

    test('обнуляет предыдущие -1', () => {
      const coordinates1 = [
        { x: 0, y: 0 },
        { x: 9, y: 0 },
        { x: 9, y: 9 },
        { x: 0, y: 9 },
      ];
      const coordinates2 = [
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 5, y: 5 },
        { x: 4, y: 5 },
      ];

      let cells: Array<Array<number>>;

      field.setBarriers(coordinates1);
      cells = field.getCells();
      expect(coordinates1.every(({ x, y }) => cells[y][x] === -1)).toBe(true);

      field.setBarriers(coordinates2);
      cells = field.getCells();
      expect(coordinates2.every(({ x, y }) => cells[y][x] === -1)).toBe(true);
      expect(coordinates1.every(({ x, y }) => cells[y][x] === 0)).toBe(true);

      field.setBarriers([]);
      cells = field.getCells();
      expect(cells.every((row) => row.every((cell) => cell === 0))).toBe(true);
    });
  });

  describe('setCells', () => {
    test('существует', () => {
      expect(field.setCells).toBeDefined();
      expect(typeof field.setCells).toBe('function');
    });

    test('возвращает this', () => {
      expect(field.setCells()).toBe(field);
    });

    test('создает двумерный массив заданной длинны', () => {
      expect(Array.isArray(fakeField.cells)).toBe(true);
      expect(fakeField.cells.every((row) => Array.isArray(row))).toBe(true);
      expect(fakeField.cells.length).toBe(fakeField.size);
      expect(
        fakeField.cells.every((row) => row.length === fakeField.size)
      ).toBe(true);
    });

    test('заполняет двумерный массив 0', () => {
      expect(
        fakeField.cells.every((row) => row.every((cell) => cell === 0))
      ).toBe(true);
    });
  });
});

describe('convertCoordinate', () => {
  test('существует', () => {
    expect(convertCoordinate).toBeDefined();
    expect(typeof convertCoordinate).toBe('function');
  });

  test('возвращает корректные координаты', () => {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);

    expect(convertCoordinate(`${x};${y}`)).toEqual({ x, y });
  });
});
