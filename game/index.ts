type Coordinate = { x: number; y: number };
type Direction = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT';
type Command = 'TURN_RIGHT' | 'FORWARD' | 'TURN_LEFT';

export class Field {
  private size: number;
  private cells: Array<Array<number>>;

  constructor(size: number) {
    this.size = size;
    this.cells = [];

    this.setCells();
  }

  getCells(): Array<Array<number>> {
    return this.cells.map((row) => Array.from(row));
  }

  getCoordinatesAround(center: Coordinate): Array<Coordinate> {
    return [
      { x: center.x, y: center.y - 1 },
      { x: center.x + 1, y: center.y },
      { x: center.x, y: center.y + 1 },
      { x: center.x - 1, y: center.y },
    ].filter(
      (coordinate) =>
        this.cells[coordinate.y] !== undefined &&
        this.cells[coordinate.y][coordinate.x] !== undefined
    );
  }

  /** @tutorial https://ru.wikipedia.org/wiki/Алгоритм_Ли */
  getPath(start: Coordinate, finish: Coordinate): Array<Coordinate> {
    const cells = this.getCells();

    cells[start.y][start.x] = 1;

    for (
      let d = cells[start.y][start.x];
      cells[finish.y][finish.x] === 0;
      d += 1
    ) {
      let propagations: Array<boolean> = [false];

      for (let y = 0; y < cells.length; y += 1) {
        const row = cells[y];

        for (let x = 0; x < row.length; x += 1) {
          const value = row[x];

          if (value === d) {
            const coordinatesAround = this.getCoordinatesAround({ x, y });

            for (let i = 0; i < coordinatesAround.length; i += 1) {
              const { x: aroundX, y: aroundY } = coordinatesAround[i];

              if (cells[aroundY][aroundX] === 0) {
                cells[aroundY][aroundX] = d + 1;
                propagations = propagations.concat(true);
              }
            }
          }
        }
      }

      if (!propagations.some((propagation) => propagation === true)) break;
    }

    let path: Array<Coordinate> = [];

    if (cells[finish.y][finish.x] === 0) {
      return path;
    }

    path = path.concat({ x: finish.x, y: finish.y });

    for (
      let d = cells[finish.y][finish.x];
      d > cells[start.y][start.x];
      d -= 1
    ) {
      const coordinatesAround = this.getCoordinatesAround(
        path[path.length - 1]
      );

      for (let i = 0; i < coordinatesAround.length; i += 1) {
        const { x: aroundX, y: aroundY } = coordinatesAround[i];

        if (cells[aroundY][aroundX] === d - 1) {
          path = path.concat(coordinatesAround[i]);
          break;
        }
      }
    }

    return path.reverse();
  }

  getSize(): number {
    return this.size;
  }

  setCells(): this {
    this.cells = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => 0)
    );

    return this;
  }

  setBarriers(barriers: Array<Coordinate>): this {
    this.setCells();

    barriers.forEach((barrier) => {
      this.cells[barrier.y][barrier.x] = -1;
    });

    return this;
  }
}

export function convertCoordinate(gameCoordinate: string): Coordinate {
  const [x, y] = gameCoordinate
    .split(';')
    .map((partOfCoordinate) => Number.parseInt(partOfCoordinate, 10));

  return { x, y };
}

export function coordinatesInDirection(
  curr: Coordinate,
  next: Coordinate
): Direction | 'IN_PLACE' {
  if (curr.y - next.y > 0) return 'TOP';
  if (curr.x - next.x < 0) return 'RIGHT';
  if (curr.y - next.y < 0) return 'BOTTOM';
  if (curr.x - next.x > 0) return 'LEFT';

  return 'IN_PLACE';
}

export function coordinatesInCommand(
  prev: Coordinate,
  curr: Coordinate,
  next: Coordinate
): Command | 'IN_PLACE' {
  const prevToCurr = coordinatesInDirection(prev, curr);
  const currToNext = coordinatesInDirection(curr, next);

  if (prevToCurr === 'TOP' && currToNext === 'TOP') return 'FORWARD';
  if (prevToCurr === 'TOP' && currToNext === 'RIGHT') return 'TURN_RIGHT';
  if (prevToCurr === 'TOP' && currToNext === 'LEFT') return 'TURN_LEFT';
  if (prevToCurr === 'RIGHT' && currToNext === 'TOP') return 'TURN_LEFT';
  if (prevToCurr === 'RIGHT' && currToNext === 'RIGHT') return 'FORWARD';
  if (prevToCurr === 'RIGHT' && currToNext === 'BOTTOM') return 'TURN_RIGHT';
  if (prevToCurr === 'BOTTOM' && currToNext === 'RIGHT') return 'TURN_LEFT';
  if (prevToCurr === 'BOTTOM' && currToNext === 'BOTTOM') return 'FORWARD';
  if (prevToCurr === 'BOTTOM' && currToNext === 'LEFT') return 'TURN_RIGHT';
  if (prevToCurr === 'LEFT' && currToNext === 'TOP') return 'TURN_RIGHT';
  if (prevToCurr === 'LEFT' && currToNext === 'BOTTOM') return 'TURN_LEFT';
  if (prevToCurr === 'LEFT' && currToNext === 'LEFT') return 'FORWARD';

  return 'IN_PLACE';
}

let field: Field;
let snake: Array<Coordinate>;
let currentMeal: Coordinate;

export function startGame(
  _snake: Array<string>,
  _meals: Array<string>,
  _fieldSize: number
): void {
  field = new Field(_fieldSize);
  snake = _snake.map(convertCoordinate);
  currentMeal = convertCoordinate(_meals[0]);
}

export function getNextCommand(_snake: Array<string>, _meal: string): string {
  snake = _snake.map(convertCoordinate);
  currentMeal = convertCoordinate(_meal);

  if (snake[1] === undefined) {
    return 'TURN_LEFT';
  }

  return coordinatesInCommand(
    snake[1],
    snake[0],
    field.setBarriers(snake).getPath(snake[0], currentMeal)[1]
  );
}
