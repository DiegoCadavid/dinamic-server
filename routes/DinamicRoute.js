const express = require("express");
const { default: mongoose } = require("mongoose");
const parseSchema = require("../helpers/parseSchema");

/**
 * Crea una CRUD con sus respectivas rutas y validacioens a base de un Modelo
 */
class DinamicRoute {

  constructor(name = "", model = mongoose.Model) {
    // Creamos la ruta
    this.dinamicRoute = express.Router();
    this.nameDinamicRoute = name;
    this.Model = model;

    this.schemaObj = Object.keys(model.schema.paths)
      .map((m) => {
        const infoSchema = model.schema.paths[m];
        return parseSchema(infoSchema);
      })
      .filter((isExist) => {
        return !isExist ? false : true;
      });

    // Creamos la ruta
    this.createRoutes();
  }

  /**
   * MIDDLEWARE | Validamos si existen los campos requeridos
   */
  validateRequiredValues() {
    const schemaObj = this.schemaObj;

    return (req, res, next) => {
      const body = req.body;

      const bodyRequiredList = [];
      //Validamos si los datos con el parametro "required" fueron pasados
      schemaObj.forEach((schemaItem) => {
        if (
          schemaItem.validators.map(({ name }) => name).includes("required")
        ) {
          if (!body[schemaItem.name]) {
            bodyRequiredList.push({
              name: schemaItem.name,
              msg: `${schemaItem.name} es obligatorio`,
            });
          }
        }
      });

      if (bodyRequiredList.length > 0) {
        return res.status(400).json(bodyRequiredList);
      }

      next();
    };
  }

  /**
   * MIDDLEWARE | Validamos el tipo de valor de los datos del body
   */
  validateTypesValue() {
    const schemaObj = this.schemaObj;

    return (req, res, next) => {
      // Obtenemos los datos del body
      const body = req.body;

      const bodyValueErrors = [];
      Object.keys(body)
        .filter((bodyItemName) => {
          if (schemaObj.map(({ name }) => name).includes(bodyItemName)) {
            return true;
          }

          return false;
        })
        .forEach((bodyItemName) => {
          const bodyItemValue = body[bodyItemName];
          const bodyItemSchema =
            schemaObj[schemaObj.map(({ name }) => name).indexOf(bodyItemName)];

          // Validamos los tipos de datos
          if (!(typeof bodyItemValue == bodyItemSchema.type.toLowerCase())) {
            bodyValueErrors.push({
              name: bodyItemName,
              msg: `El valor del ${bodyItemName} debe ser un <${bodyItemSchema.type}>`,
            });
          }
        });

      if (bodyValueErrors.length > 0) {
        return res.status(400).json(bodyValueErrors);
      }

      next();
    };
  }

  /**
   * MIDDLEWARE | Realizamos las validaciones del schema
   */
  validateSchemaValues() {

    // String -> minLength, maxLength, match
    // Number -> min, max
    // Date -> min, max, expires

    const schemaObj = this.schemaObj;

    return (req, res, next) => {
      const body = req.body;

      const validationsErrors = [];

      Object.keys(body)
        .filter((bodyItemName) => {
          if (schemaObj.map(({ name }) => name).includes(bodyItemName)) {
            return true;
          }

          return false;
        })
        .forEach((bodyItemName) => {
          const bodyItemValue = body[bodyItemName];
          const bodyItemSchema =
            schemaObj[schemaObj.map(({ name }) => name).indexOf(bodyItemName)];

          bodyItemSchema.validators
            .filter(({ name }) => (name == "required" ? false : true))
            .forEach((itemValidate) => {
              // En caso de validar un regex
              if (itemValidate.name == "regexp") {
                if (!bodyItemValue.match(itemValidate.value)) {
                  validationsErrors.push({
                    name: bodyItemName,
                    msg: `${bodyItemName} es invalido`,
                  });
                }
              }

              // En caso de validar un min
              if (itemValidate.name == "min") {
                if (itemValidate.value === true) {
                  if (bodyItemValue < 0) {
                    validationsErrors.push({
                      name: bodyItemName,
                      msg: `${bodyItemName} debe ser mayor a 0`,
                    });
                  }
                } else {
                  if (bodyItemValue < itemValidate.value) {
                    validationsErrors.push({
                      name: bodyItemName,
                      msg: `${bodyItemName} debe ser mayor a ${itemValidate.value}`,
                    });
                  }
                }
              }

              // En caso de que sea un max
              if (itemValidate.name == "max") {
                if (bodyItemValue > itemValidate.value) {
                  validationsErrors.push({
                    name: bodyItemName,
                    msg: `${bodyItemName} debe ser menor a ${itemValidate.value}`,
                  });
                }
              }
            });
        });

      if (validationsErrors.length > 0) {
        return res.status(400).json(validationsErrors);
      }

      next();
    };
  }

  /**
   * MIDDLEWARE | Verificamos si los valores son unicos
   */
  validateUniquedValues() {
    const schemaObj = this.schemaObj;
    const Model = this.Model;

    return async (req, res, next) => {
      const body = req.body;

      const uniqueErrors = [];
      const uniqueValues = Object.keys(body)
        .filter((bodyItemName) => {
          if (schemaObj.map(({ name }) => name).includes(bodyItemName))
            return true;
          return false;
        })
        .filter((bodyItemName) => {
          if (
            schemaObj[schemaObj.map(({ name }) => name).indexOf(bodyItemName)]
              .isUnique
          ) {
            return true;
          }

          return false;
        })
        .map((bodyItemName) => {
          return {
            name: bodyItemName,
            value: body[bodyItemName],
          };
        });

      for (const index in uniqueValues) {
        const bodyItem = uniqueValues[index];
        const bodyItemModel = await Model.findOne({
          [bodyItem.name]: bodyItem.value,
        });

        if (bodyItemModel) {
          uniqueErrors.push({
            name: bodyItem.name,
            msg: `${bodyItem.name} ya existe`,
          });
        }
      }

      if (uniqueErrors.length > 0) {
        return res.status(400).json(uniqueErrors);
      }

      next();
    };
  }

  validateIdMongoParams() {
    const Model = this.Model;
    const nameDinamicRoute = this.nameDinamicRoute;
    return async (req, res, next) => {
      const { id = "" } = req.params;
      const regexMongoId = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
      if (!regexMongoId.test(id)) {
        return res.status(400).json({
          msg: "Id invalido",
        });
      }
      const model = await Model.findById(id);

      if (!model) {
        return res.status(400).json({
          msg: `No existe un ${nameDinamicRoute} con ese ID`,
        });
      }

      next();
    };
  }

  createRoutes() {
    // CRUD
    // CREATE
    this.dinamicRoute.post(
      "/",
      [
        this.validateRequiredValues(),
        this.validateTypesValue(),
        this.validateSchemaValues(),
        this.validateUniquedValues(),
      ],
      async (req, res) => {
        try {
          const body = req.body;

          // Creamos el modelo
          let modelData = {};

          Object.keys(body)
            .filter((bodyItemName) => {
              if (this.schemaObj.map(({ name }) => name).includes(bodyItemName))
                return true;
              return false;
            })
            .map((bodyItemName) => {
              return {
                name: bodyItemName,
                value: body[bodyItemName],
              };
            })
            .forEach((bodyItem) => {
              modelData[bodyItem.name] = bodyItem.value;
            });

          const model = await new this.Model(modelData);
          await model.save();

          res.status(200).json(model);
        } catch (error) {
          console.log(`${error}`.red);
          res.status(500).json({
            msg: "SERVER ERROR",
          });
        }
      }
    );

    // READ

    this.dinamicRoute.get("/", async (req, res) => {
      try {
        const perPage = Math.abs(Number(req.query?.perPage) || 10);
        const page = Math.abs(Number(req.query?.page) || 1);
        const q = req.query?.q || "";

        const modelList = await this.Model.find({ [this.schemaObj[0].name] : new RegExp(q, "gi") });
        const modelListPage = modelList
          .filter((modelItem, index) => {
            if (index + 1 < perPage * (page - 1)) {
              return false;
            }

            return true;
          })
          .filter((modalItem, index) => {
            if (index + 1 > perPage) {
              return false;
            }

            return true;
          });

        const pagesCount = Math.ceil(modelList.length / perPage);

        res.status(200).json({
          perPage,
          page,
          pagesCount,
          data: modelListPage,
        });
      } catch (error) {
        console.log(`${error}`.red);
        res.status(500).json({
          msg: "SERVER ERROR",
        });
      }
    });

    // GET BY ID
    this.dinamicRoute.get(
      "/:id",
      [this.validateIdMongoParams()],
      async (req, res) => {
        try {
          const { id } = req.params;
          const model = await this.Model.findById(id);

          res.status(200).json(model);
        } catch (error) {
          console.log(`${error}`.red);
          res.status(500).json({
            msg: "SERVER ERROR",
          });
        }
      }
    );

    // UPDATE
    this.dinamicRoute.put(
      "/:id",
      [
        this.validateTypesValue(),
        this.validateSchemaValues(),
        this.validateUniquedValues(),
      ],
      async (req, res) => {
        try {
          const { id } = req.params;
          const body = req.body;

          const model = await this.Model.findById(id);

          if (!model) {
            return res.status(400).json({
              msg: `No existe un ${this.nameDinamicRoute} con ese ID`,
            });
          }
          let modelData = {};

          Object.keys(body)
            .filter((bodyItemName) => {
              if (this.schemaObj.map(({ name }) => name).includes(bodyItemName))
                return true;
              return false;
            })
            .map((bodyItemName) => {
              return {
                name: bodyItemName,
                value: body[bodyItemName],
              };
            })
            .forEach((bodyItem) => {
              modelData[bodyItem.name] = bodyItem.value;
            });

          const updatedModel = await this.Model.findByIdAndUpdate(
            id,
            modelData,
            {
              new: true,
            }
          );

          res.status(200).json(updatedModel);
        } catch (error) {
          console.log(`${error}`.red);
          res.status(500).json({
            msg: "SERVER ERROR",
          });
        }
      }
    );

    // REMOVE BY ID
    this.dinamicRoute.delete(
      "/:id",
      [this.validateIdMongoParams()],
      async (req, res) => {
        try {
          const { id } = req.params;

          await this.Model.findByIdAndDelete(id);
          res.status(200).json({
            msg: "Usuario removido",
          });
        } catch (error) {
          console.log(`${error}`.red);
          res.status(500).json({
            msg: "SERVER ERROR",
          });
        }
      }
    );

    // VIEW INFO
    this.dinamicRoute.post("/route", (req, res) => {
      const formatSchema = this.schemaObj.map((element) => {
        const formatValidations = element.validators.map((v) => {
          if (v.name == "regexp") {
            return {
              name: v.name,
              value: { source: v.value.source, flags: v.value.flags },
            };
          }

          return v;
        });


        return {
          name: element.name,
          type: element.type,
          validators: formatValidations,
          isUnique: element.isUnique
        };
      });

      res.status(200).json({
        schema: formatSchema,
      });
    });
  }

  init() {
    return this.dinamicRoute;
  }
}

module.exports = DinamicRoute;
