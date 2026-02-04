'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
  
   static associate(models) {
 
  Student.hasMany(models.Zaduzenje, {
    foreignKey: 'studentId',
    as: 'zaduzenja'
  });
}
  }
  Student.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    ime: DataTypes.STRING,
    prezime: DataTypes.STRING,
    brojIndeksa: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: 'Student',
    timestamps: false
  });
  return Student;
};