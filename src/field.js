const FieldEnum = require("./field-enum");

class Field {
    constructor(
        field = '0000000000,0000000000,0000000000,0000000000,0000000000,0000000000,0000000000,0000000000,0000000000,0000000000',
        ships = []
    ) {
        this.fields = field.split(this._cellSeparator);
        this.ships = ships;
    }

    fire(position) {
        if (
            typeof position !== 'string' ||
            position.length !== 2 ||
            position.replaceAll(/\D/g, '').length !== 2
        ) {
            throw new this._errorClass('invalid position');
        }

        const cellValue = this._getCellField(position);
        if (!this.possibleShots.includes(cellValue)) {
            throw new this._errorClass('Stupid shot');
        }
        const cellStatus =
            cellValue === FieldEnum.ship ? FieldEnum.hit : FieldEnum.missed;
        this._setCellField(position, cellStatus);
        return cellStatus;
    }

    _getCellField(position) {
        return this.fields[position[1]][position[0]];
    }

    _setCellField(position, status) {
        const [x, y] = position;
        const verticalPart = this.fields[y].split('');
        verticalPart[x] = status;
        this.fields[y] = verticalPart.join('');
    }

    /**
     *
     * @param {string[]} ships
     */
    placeShips(ships) {
        const cells = ships.join(this._cellSeparator).split(this._cellSeparator);
        cells.forEach((cell) => this._setCellField(cell, FieldEnum.ship));
        this.ships = ships;
    }

    validateShips(ships, shipsFleetSettings) {
        const newShips = ships.map((ship) => this._isValidShip(ship));
        if (newShips.find((el) => el === false)) {
        }
        if (this._isShipsIntersect(newShips)) {
            console.log(Field.createFieldWithShips(newShips)._toPrint());
            console.log(newShips);
            throw new this._errorClass('Ships Intersect');
        }
        const fleet = newShips.reduce((acc, ship) => {
            const shipLength = ship.split(',').length;
            acc[shipLength] = acc[shipLength] + 1 || 1;
            return acc;
        }, {});
        for (const shipLength in fleet) {
            if (fleet[shipLength] !== shipsFleetSettings[shipLength]) throw new this._errorClass('Invalid fleet', shipLength);
        }
        return newShips;
    }

    _isValidShip(ship) {
        if (!this._shipCheckRegexp.test(ship))
            throw new this._errorClass('Invalid ship', ship);
        const cells = ship.split(',');
        if (cells.length > 1) {
            let direction = null;
            if (new Set(cells.map((v) => v[0])).size === 1) direction = 1;
            if (new Set(cells.map((v) => v[1])).size === 1) direction = 0;
            if (direction === null) throw new this._errorClass('Invalid ship', ship);
            cells.sort((a, b) => (a[direction] > b[direction] ? 1 : -1));
            this._isShipComponentFollows(cells, direction);
            return cells.join(',');
        } else {
            return ship;
        }
    }

    _isShipComponentFollows(ship, direction) {
        for (let i = 0; i < ship.length - 1; i++) {
            if (ship[i + 1][direction] - ship[i][direction] !== 1)
                throw new this._errorClass('Ship component not follow', ship);
        }
    }

    _isShipsIntersect = (ships) => {
        const cellsSet = new Set(this._getAreaAroundShip(ships[0]));
        for (let shipIndex = 1; shipIndex < ships.length; shipIndex++) {
            const ship = ships[shipIndex];
            const shipCells = ship.split(',');
            if (shipCells.some((cell) => cellsSet.has(cell)))
                throw new this._errorClass(shipCells.join(','));
            this._getAreaAroundShip(ship).forEach((cell) => cellsSet.add(cell));
        }
        return false;
    };

    _getAreaAroundShip(ship) {
        const shipCells = ship.split(',');
        const firstCell = shipCells[0];
        const lastCell = shipCells[shipCells.length - 1];
        const firstFormatedCell = `${Number(firstCell[0]) - 1 === -1 ? 0 : Number(firstCell[0]) - 1
            }${Number(firstCell[1]) - 1 === -1 ? 0 : Number(firstCell[1]) - 1}`;
        const lastFormatedCell = `${Number(lastCell[0]) + 1 === 10 ? 9 : Number(lastCell[0]) + 1
            }${Number(lastCell[1]) + 1 === 10 ? 9 : Number(lastCell[1]) + 1}`;
        const horizontal = Number(lastFormatedCell[0] - firstFormatedCell[0]);
        const vertical = Number(lastFormatedCell[1] - firstFormatedCell[1]);
        return new Array(horizontal + 1)
            .fill(null)
            .map((v, i) => `${Number(firstFormatedCell[0]) + i}`)
            .map((v) =>
                new Array(vertical + 1)
                    .fill(null)
                    .map((_, i) => `${v}${Number(firstFormatedCell[1]) + i}`)
            )
            .flat();
    }

    fieldToString() {
        return this.fields.join(',');
    }
    static createFieldWithShips(ships) {
        const field = new Field();
        field.placeShips(ships);
        return field;
    }
}
Field.prototype.possibleShots = [FieldEnum.free, FieldEnum.ship];
Field.prototype._cellSeparator = ',';
Field.prototype._errorClass = Error
Field.prototype._shipCheckRegexp = new RegExp(
    '([0123456789]{2},)*[0123456789]{2}'
);

module.exports = Field;
