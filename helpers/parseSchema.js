/**
 * Formatea los valores de un item del Schema
 * @param infoSchema item del Schema
 * @returns El item del Schema formateado
 */
const parseSchema = (infoSchema = {}) => {
  // Descartamos valores
  if (infoSchema.path == "_id" || infoSchema.path == "__v") return;

  //   Obtenemos sus validaciones
  const validatorsSchema = infoSchema.validators
    .map((value) => {
      if (value.type == "user defined") return;
      return {
        name: value.type,
        value: value[value.type] ? value[value.type] : true,
      };
    })
    .filter((value) => {
      if (!value) return;
      return value;
    });

  // Returnamos valores
  return {
    name: infoSchema.path,
    type: infoSchema.instance,
    validators: validatorsSchema,
    isUnique: infoSchema.options?.unique ? true : false,
  };
};

module.exports = parseSchema;
