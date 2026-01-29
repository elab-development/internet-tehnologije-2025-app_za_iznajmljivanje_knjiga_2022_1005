'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Publikacija extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Publikacija.init({
    naziv: DataTypes.STRING,
    isbn: DataTypes.STRING,
    autor: DataTypes.STRING,
    stanje: DataTypes.INTEGER,
    kategorijaId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Publikacija',
  });
  return Publikacija;
};