const FieldEnum = require("./field-enum");

class Field {
    constructor(
        field = '0000000000,0000000000,0000000000,0000000000,0000000000,0000000000,0000000000,0000000000,0000000000,0000000000',
        ships = []
    ) {
        this.fields = field.split(',');
        this.ships = ships;
    }

    fire(position) {
        if (
            typeof position !== 'string' ||
            position.length !== 2 ||
            position.replaceAll(/\D/g, '').length !== 2
        ) {
            throw new this.errorClass('invalid position');
        }

        const cellValue = this._getCellField(position);
        if (!this.possibleShots.includes(cellValue)) {
            throw new this.errorClass('Stupid shot');
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

    /**
     *
     * @param {string[]} ships
     */
    isShipDestroyedByCell(ship) {
        return ship
            .split(',')
            .every((shipCell) => this._getCellField(shipCell) === FieldEnum.hit);
    }

    findShipByCell(cell) {
        return this.ships.find((ship) => ship.includes(cell));
    }

    prepareFieldToOponnent() {
        return this.fieldToString().replaceAll(FieldEnum.ship, FieldEnum.free);
    }

    isAllShipDestroyed() {
        return !this.fieldToString().includes(FieldEnum.ship);
    }

    fieldToString() {
        return this.fields.join(',');
    }

    _prepareDataToJson() {
        return { field: this.fieldToString(), ships: this.ships };
    }

    static createFieldWithShips(ships) {
        const field = new Field();
        field.placeShips(ships);
        return field;
    }
}
Field.prototype.possibleShots = [FieldEnum.free, FieldEnum.ship];
Field.prototype._cellSeparator = ',';
Field.prototype.errorClass = Error

module.exports = Field;
