'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sluzbenik extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Sluzbenik.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    ime: DataTypes.STRING,
    prezime: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Sluzbenik',
  });
  return Sluzbenik;
};