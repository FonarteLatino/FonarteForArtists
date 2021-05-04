const dboperations = require('./dboperations');
const exOperations = require('./externalOperations');

async function actualizarArtistas(){
    //llamada a al base de datos general para recuperar todos los artistas
    let artistasEx = await exOperations.artistasEx();
    //recuperar los artistas de la base de datos local
    let artistas = await dboperations.artistasLocal();
    if (!artistasEx){
        console.log("no se pudo hacer")
        return 0;
    }
    console.log(artistas);
    let insertar = [];
    let eliminar = [];
    //Recorre todos los artistas de la base de datos origen para coprobar cuales faltan en la base de datos local
    for (const iterator of artistasEx[0]) {
        //console.log(iterator.ARTIST);
        let a = artistas.find(artis => artis.nombre === iterator.ARTIST);
        if (a == undefined) {
            console.log("Elementos a insertar");
            console.log(a);
            console.log(iterator.ARTIST);
            insertar.push(iterator.ARTIST);
        }
    }
    console.log(insertar);
    //Se insertan los artista si es que existe nuevos artistas
    if(insertar.length>0){
        let c = 0;
        let e = "";
        let q = 'INSERT INTO `artista`(`nombre`) VALUES (\'';
        for (const iter of insertar) {
            c++;
            console.log(iter);
            e = remplaced.replaceall('\'', '\\\'',iter);
            if (c<insertar.length) {
                q = q+e+"\'),(\'";
            }else {
                q = q+e+"\')";
            }
        }
        await dboperations.ejecutarQuery(q);
    }
    //Este tramo de codigo se ejecuta solo si la base de datos local no esta vacia
    if(artistas.length>0){
        for (const itera of artistas) {
            let b = artistasEx[0].find(artis => artis.ARTIST === itera.nombre);
            if (b == undefined) {
                console.log("Elementos a eliminar");
                console.log(b);
                console.log(itera);
                eliminar.push(itera.id);
            }
        }
        console.log(eliminar);
        //Este segmento de codigo se ejecuta si existen Artistas para eliminar
        if(eliminar.length>0){
            c = 0;
            q = 'DELETE FROM `artista` WHERE `id` = ';
            console.log(c);
            console.log(q);
            for (const iterator of eliminar) {
                c++;
                if (c<eliminar.length) {
                    q = q + iterator + ' or `id` = ';
                }else {
                    q = q + iterator;
                }
            }
            console.log(q);
            await dboperations.ejecutarQuery(q);
        }
    }
    return 1;
}

async function actualizarDiscos(){
    //llamada a al base de datos general para recuperar todos los discos
    let discosEx = await exOperations.discosEx();
    console.log(discosEx);
    if (!discosEx){
        console.log("no se pudo hacer")
        return 0;
    }
    //recuperar los discos de la base de datos local
    let discos = await dboperations.discosLocal();
    console.log(discos);
    let insertar = [];
    let eliminar = [];
    //Recorre todos los discos de la base de datos origen para coprobar cuales faltan en la base de datos local
    for (const iterator of discosEx[0]) {
        //console.log(iterator);
        let a = discos.find(disco => disco.UPC == iterator.UPC);
        if (a == undefined) {
            //console.log("Elementos a insertar");
            //console.log(a);
            console.log(iterator);
            insertar.push(iterator);
        }
    }
    console.log(insertar);
    console.log("proceso de incert");
    if(insertar.length>0){
        var c = 0;
        var e = "";
        var id = "";
        var q = 'INSERT INTO `disco`(`UPC`, `artista_id`, `nombre`) VALUES (\'';
        for (const iter of insertar) {
            let d = discos.find(disco => disco.ARTIST === iter.ARTIST);
            if (d==undefined) {
                console.log("Hay que hacer un query");
                let r = await dboperations.artistaLocal(iter.ARTIST);
                console.log(iter.ARTIST);
                console.log(r);
                id = r[0].id;
            }else {
                console.log(d);
                console.log(iter);
                id = d.artista_id;
            }
            c++;
            console.log(id);
            e = iter.ALBUM_NAME.split("\'").join("\\\'");
            let e = remplaced.replaceall('\'', '\\\'',element.TRACK_NAME);
            if (c<insertar.length) {
                q = q+iter.UPC+'\','+id+',\''+e+"\'),(\'";
            }else {
                q = q+iter.UPC+'\','+id+',\''+e+"\')";
            }
            id='';
        }
        await dboperations.ejecutarQuery(q);
        console.log(q);
    }
    //Este tramo de codigo se ejecuta solo si la base de datos local no esta vacia
    if(discos.length>0){
        for (const itera of discos) {
            let b = discosEx[0].find(disco => disco.ARTIST === itera.ARTIST);
            if (b == undefined) {
                console.log("Elementos a eliminar");
                console.log(b);
                console.log(itera);
                eliminar.push(itera.UPC);
            }
        }
        console.log(eliminar);
        //Este segmento de codigo se ejecuta si existen Discos para eliminar
        if(eliminar.length>0){
            c = 0;
            q = 'DELETE FROM `disco` WHERE `UPC` = ';
            q1 = 'DELETE FROM `sello_disco` WHERE `UPC` = '
            console.log(c);
            console.log(q);
            for (const iterator of eliminar) {
                c++;
                if (c<eliminar.length) {
                    q = q + iterator + ' or `UPC` = ';
                    q1 = q1 + iterator + ' or `UPC` = ';
                }else {
                    q = q + iterator;
                    q1 = q1 + iterator;
                }
            }
            console.log(q);
            await dboperations.ejecutarQuery(q1);
            await dboperations.ejecutarQuery(q);
        }
    }
    return 1;

}

async function actualizarCanciones(){
    //llamada a al base de datos general para recuperar todos los canciones
    let cancionesEx = await exOperations.cancionesEx();
    //console.log(cancionesEx);
    if (!cancionesEx){
        console.log("no se pudo hacer")
        return 0;
    }
    //recuperar los canciones de la base de datos local
    let canciones = await dboperations.cancionesLocal();
    //console.log(canciones);
    let insertar = [];
    let eliminar = [];
    //Recorre todos los canciones de la base de datos origen para coprobar cuales faltan en la base de datos local
    for (const iterator of cancionesEx[0]) {
        //console.log(iterator.ISRC);
        let a = canciones.find(canciones => canciones.ISRC == iterator.ISRC&&canciones.disco_UPC == iterator.UPC);
        //console.log(a);
        if (a == undefined) {
            //console.log("Elementos a insertar");
            //console.log(a);
            console.log(iterator);
            insertar.push(iterator);
        }
    }
    //console.log(insertar);
    console.log("proceso de incert");
    if(insertar.length>0){
        var c = 0;
        var e = "";
        var UPC = "";
        var q = 'INSERT INTO `cancion`(`ISRC`, `disco_UPC`, `nombre`) VALUES (\'';
        for (const iter of insertar) {
            c++;
            //console.log(UPC);
            
            e = iter.TRACK_NAME.split("\'").join("\\\'");
            
            if (c<insertar.length) {
                q = q+iter.ISRC+'\','+iter.UPC+',\''+e+'\'),(\'';
            }else {
                q = q+iter.ISRC+'\','+iter.UPC+',\''+e+'\')';
            }
            id='';
        }
        await dboperations.ejecutarQuery(q);
        console.log(q);
    }
    //Este tramo de codigo se ejecuta solo si la base de datos local no esta vacia
    if(canciones.length>0){
        for (const itera of canciones) {
            let b = cancionesEx[0].find(cancion => cancion.ISRC == itera.ISRC&&cancion.UPC == itera.disco_UPC);
            if (b == undefined && itera.ISRC!=itera.disco_UPC) {
                console.log("Elementos a eliminar");
                console.log(b);
                console.log(itera);
                let o = {
                   UPC:itera.disco_UPC,
                   ISRC:itera.ISRC 
                }
                eliminar.push(o);
            }
        }
        console.log(eliminar);
        //Este segmento de codigo se ejecuta si existen canciones para eliminar
        if(eliminar.length>0){
            c = 0;
            q = 'DELETE FROM `cancion` WHERE (`disco_UPC` = ';
            console.log(c);
            console.log(q);
            for (const iterator of eliminar) {
                c++;
                if (c<eliminar.length) {
                    q = q + iterator.UPC + ' and ISRC = \''+iterator.ISRC+'\') or (`disco_UPC` = ';
                }else {
                    q = q + iterator.UPC + ' and ISRC = \''+iterator.ISRC+'\')';
                }
            }
            console.log(q);
            await dboperations.ejecutarQuery(q);
        }
    }
    return 1;

}

async function actualizarRegalias(){
    //Calculamaos las fechas vigentes para el reporte
    var resta = 1000 * 60 * 60 * 24;
    var now= new Date();
    let m = -1;
    let a = 0;
    let f = [];
    calculo = now.getTime() - (resta * (29*2));
    let fecha = new Date(calculo);
    let am;
    let ay;
    for (let index = 0; index < 12; index++) {
        am = fecha.getMonth()-(index+m);
        ay = fecha.getFullYear()-a;
        if (am == 0)
        {
            console.log('es 12');
            m = -13;
            a = 1;
            am = fecha.getMonth()-(index+m);
            ay = fecha.getFullYear()-a;
            f.push({fecha:ay +'-'+ am});
        }
        else {
            f.push({fecha:ay +'-'+ am});
        }  
    }
    //console.log(f);
    let fechasLocal = await dboperations.fechas();
    //console.log(fechasLocal);
    for (const iterator of f) {
        //console.log(iterator);
        let a = fechasLocal.find(fech => fech.anio == iterator.fecha);
        if(a == undefined){
            console.log(iterator);
        }
    }
    return 1;
}

module.exports = {
    actualizarArtistas : actualizarArtistas,
    actualizarDiscos : actualizarDiscos,
    actualizarCanciones : actualizarCanciones,
    actualizarRegalias : actualizarRegalias
}