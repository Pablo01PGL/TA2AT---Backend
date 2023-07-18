const opendata = require('../models/opendata');

const getDatosAbiertos = async(req, res) => {

    const estilo = req.query.estilo;
    const parte_cuerpo = req.query.parte_cuerpo;
    try {
        let datos = {};
        const parametros = filtros(estilo, parte_cuerpo);
        if (parametros.size == 0) datos = await opendata.find();
        if (parametros.size == 1) {
            const nombreParam = parametros.keys().next().value;
            const valorParam = parametros.values().next().value;
            datos = await opendata.find({
                [nombreParam]: valorParam
            });
        }
        if (parametros.size > 1) {
            datos = await opendata.find({ estilo: estilo, parte_cuerpo: parte_cuerpo });
        }


        res.json({
            ok: true,
            msg: 'obtenerOpendata',
            datos
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Hubo un error al obtener los datos abiertos');
    }
};

function filtros(estilo, parte_cuerpo) {

    const mapaFiltros = new Map();
    if (estilo != undefined) mapaFiltros.set('estilo', estilo);
    if (parte_cuerpo != undefined) mapaFiltros.set('parte_cuerpo', parte_cuerpo);

    return mapaFiltros;
}

module.exports = { getDatosAbiertos }