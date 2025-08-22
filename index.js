const { app, BrowserWindow, ipcMain ,dialog} = require('electron');
const { DateTimeOffset } = require('mssql');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs=require('fs-extra');
const { Console } = require('console');
let grupoActual='';
if (process.env.NODE_ENV!=='production'){
require('electron-reload')(__dirname,{

})
}
let win
//var sql = require("mssql");
let camino=path.join(__dirname,'/js/database.js')
let db=require(camino)
let prom=db.dameDatos('SELECT * FROM alumnos').then((datos)=>{
  //console.log("toma ya, qué bueno soy!", datos)


})
const createWindow = () => {
    console.log(path.join(__dirname, '/js/preload.js'))

    win = new BrowserWindow({
  
     width: 800,

     height: 600,
     autoHideMenuBar: true,

     webPreferences: {
      preload: path.join(__dirname, '/js/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
   });
  
   win.loadFile('./src/index.html');

   win.maximize();

  };
  
  app.whenReady().then(() => {
  
   createWindow();
  
   app.on('activate', () => {
  
     if (BrowserWindow.getAllWindows().length === 0) {
  
       createWindow();
  
     }
  
   });
  
  });
  
  app.on('window-all-closed', () => {
  
   if (process.platform !== 'darwin') {
  
     app.quit();
  
   }
  
  });
  ipcMain.on("ponerParte",()=>{
    win.loadFile('./src/ponerParte.html');
  })
  ipcMain.on("consultarPartes",()=>{
    win.loadFile('./src/consultarPartes.html');
  })
  ipcMain.on("dameGrupos",()=>{
    let grupos=db.dameDatos("SELECT DISTINCT GRUPO FROM alumnos ORDER BY GRUPO").then((datos)=>{

win.webContents.send("tomaGrupos",(datos))
    })
  })
  ipcMain.on("grabaParte",function(event,datos){
    db.dameDatos("INSERT INTO partes (alumno,profesor,fecha,hora,grave,convivencia,descripcion,faltaAsistencia,desconsideracion,interrumpeClase,alteraActividades,conductasImpropias,indisciplina,deterioroClase,deterioroPropiedades,usaAscensor,actoInjustificado,indisciplinaGrave,perjuicioSalud,agresionGrave,suplantacion,danyoGrave,racista,reiteracion,incumplimiento,abandonaCentro,usaMovil,movilExamen) VALUES (?)",
    [datos.id,datos.profesor,datos.fecha,datos.hora,datos.grave,datos.convivencia,datos.descripcion,datos.faltaAsistencia,datos.desconsideracion,datos.interrumpeClase,
      datos.alteraActividades,datos.conductasImpropias,datos.indisciplina,datos.deterioroClase,datos.deterioroPropiedades,datos.usaAscensor,
      datos.actoInjustificado,datos.indisciplinaGrave,datos.perjuicioSalud,datos.agresionGrave,datos.suplantacion,datos.danyoGrave,datos.racista,
      datos.reiteracion,datos.incumplimiento,datos.abandonaCentro,datos.usaMovil,datos.movilExamen]).then(()=>{
        dialog.showMessageBox(win,
          {
            type: 'question',
            buttons: ['Sí, quiero el pdf', 'No es necesario'],
            title: 'Borrar parte',
            cancelId: 99,
            message:
              'El parte ya consta en la base de datos. ¿Quieres generar un pdf?',
          }
      )
      .then((response)=>{
        console.log(response);
        if (response.response==0){ 
          console.log("Generando parte: "+datos)
          solicitaPdf(datos);
        }else{
          console.log("Pues no hago pdf");
        }
      })
      }); 

  })
  ipcMain.on("faltanDatos",function(event){
    dialog.showMessageBox(win,
      {
        type: 'warning',
        buttons: ['De acuerdo'],
        title: 'Faltan datos',
        cancelId: 99,
        message:
          'Faltan datos para rellenar el parte correctamente'
      });
  })
  function solicitaPdf(datos){
//console.log("Solicitando: "+JSON.stringify(datos));
let parteI=[];
  let nombreAlumno='';
  let cadena=datos.nombre+'.pdf';
  let ruta='';
  console.log("Fecha"+datos.fecha)
  db.dameDatos("SELECT * FROM partes WHERE alumno='"+datos.id+"' AND fecha='"+datos.fecha+"' AND hora='"+datos.hora+"'")
.then((parte)=>{
  parteI=parte;
}).then(()=>{
  const pObj = dialog.showSaveDialog(win,{
    title: 'Guardar pdf',
    defaultPath: path.join(__dirname, cadena),
    filters: [
     { name: 'Documentos pdf', extensions: ['pdf'] }
    ]
   
  });
  pObj.then(
    onResolved => {
      if (!onResolved.canceled) {
          filename = onResolved.filePath;
          ruta=filename;
  console.log(filename);
      }
    },
    onRejected => {console.log('Promise rejected')}
  ).then(()=>{
    generaPdf(parteI,ruta);
  });
})
  }
  ipcMain.on("dameAlumnos",function(event,grupo){
//console.log("Buscando: "+grupo.grupo)
console.log("A ver...")
//"SELECT * FROM alumnos WHERE GRUPO ='1ºA'"
    let grupos=db.dameDatos("SELECT * FROM alumnos WHERE GRUPO =? ORDER BY APELLIDOS",[grupo.grupo]).then((datos)=>{
     
win.webContents.send("tomaAlumnos",(datos))
    })
  })
  ipcMain.on("damePartesGrupo", function(event,grupo){
let count=0;
let partesGrupoTemporal=[];
grupoActual=grupo.grupo;
    db.dameDatos("SELECT * FROM alumnos WHERE GRUPO =? ORDER BY APELLIDOS",[grupo.grupo]).then((datos)=>{
for (let i=0;i<datos.length;i++){
   db.dameDatos("SELECT * FROM partes WHERE alumno=?",[datos[i].ALUMNO]).then((info)=>{

    if (info.length>0){
     for (let k=0;k<info.length;k++){
      info[k].nombreT=datos[i].APELLIDOS+", "+datos[i].NOMBRE
     }
    partesGrupoTemporal.push(info);
    }
count++;
if (count>datos.length-1) {
  console.log("Grupo actual: "+grupoActual)
  win.webContents.send("tomaPartesGrupo",partesGrupoTemporal)
}
  });
}

    })
  })

ipcMain.on("imprimePartesGrupo",function(event,data){
  //console.log("Grupo pasado: "+data[1])
  let cadena='partesGrupo'+data[1]+'.pdf';
  let ruta='';
  const pObj = dialog.showSaveDialog(win,{
    title: 'Guardar pdf',
    defaultPath: path.join(__dirname, cadena),
    filters: [
     { name: 'Documentos pdf', extensions: ['pdf'] }
    ]
   
  });
  pObj.then(
    onResolved => {
      if (!onResolved.canceled) {
          filename = onResolved.filePath;
          ruta=filename;
      }
    },
    onRejected => {console.log('Promise rejected')}
  ).then(()=>{
    pdfGrupo(data,ruta)
  })
})
  ipcMain.on('damePartesPrevios',function(event,alumno){
    console.log("Número de matrícula: "+alumno);
    let partes=db.dameDatos("SELECT * FROM partes WHERE alumno=? ORDER BY fecha",[alumno]).then((datos)=>{
      win.webContents.send("tomaPartes",(datos))
    })
  })
  ipcMain.on('borrarParte',function(event,datos){
    dialog.showMessageBox(win,
      {
        type: 'question',
        buttons: ['Sí, quiero borrar', 'Cancelar'],
        title: 'Borrar parte',
        cancelId: 99,
        message:
          '¿Quiere borrar el parte de incidencias con fecha ?'+datos.fecha,
      }
  ).then((response)=>{
    console.log(response);
    if (response.response==0){ 
      console.log("Borrando parte "+datos.id)
      db.dameDatos("DELETE FROM partes WHERE id=?",datos.id).then(()=>{
        let partes=db.dameDatos("SELECT * FROM partes WHERE alumno=? ORDER BY fecha",datos.alumno).then((datos)=>{

        win.webContents.send("tomaPartes",(datos));
      })
    })
    }
  })
    }
  )
ipcMain.on("pdfIndividual",function(event,datos){
  let parteI=[];
  let nombreAlumno='';
  let cadena='';
  let ruta='';
  db.dameDatos("SELECT * FROM partes WHERE id=?",datos.id)
.then((parte)=>{
  parteI=parte;
}).then(()=>{
  db.dameDatos("SELECT * FROM alumnos WHERE ALUMNO=?",[datos.alumno]).then((apellidos)=>{

    cadena='/'+apellidos[0].APELLIDOS+' '+apellidos[0].NOMBRE+'.pdf';
  }).then(()=>{
    const pObj = dialog.showSaveDialog(win,{
      title: 'Guardar pdf',
      defaultPath: path.join(__dirname, cadena),
      filters: [
       { name: 'Documentos pdf', extensions: ['pdf'] }
      ]
     
    });
  pObj.then(
    onResolved => {
      if (!onResolved.canceled) {
          filename = onResolved.filePath;
          ruta=filename;
  console.log(filename);
      }
    },
    onRejected => {console.log('Promise rejected')}
  ).then(()=>{
    generaPdf(parteI,ruta);
  });
  })
})



})
function generaPdf(parte,archivo){
   let doc=new PDFDocument({size: 'A4'})
   console.log(doc.page.width);
   let nombreAlumno='';
   db.dameDatos("SELECT * FROM alumnos WHERE ALUMNO=?",[parte[0].alumno]).then((nombre)=>{
    nombreAlumno=nombre[0].APELLIDOS+', '+nombre[0].NOMBRE
    let fecha=parte[0].fecha;
    let dia=fecha.getDate();
    let mes=fecha.getMonth()+1;
    let anyo=fecha.getFullYear();
    let fecha2=dia+'/'+mes+'/'+anyo;
 
        doc.pipe(fs.createWriteStream(archivo));
        doc.image(path.join(__dirname,'images/logoclm.png'), 100, 15, {width: 150}); 
        doc.image(path.join(__dirname,'images/cofinanciado.png'), 300, 15, {width: 50}); 
        doc.image(path.join(__dirname,'images/logoJuandeAvila.png'), 400, 15, {width: 50}); 
        doc.image(path.join(__dirname,'images/logoAlfonsoX.png'), 500, 15, {width: 50}); 
        doc
        .fontSize(18)
        .text('PARTE DISCIPLINARIO', 200, 80)
        doc.x=30
        doc.y=117
        doc.fontSize(14)
        .text('Alumno: '+nombreAlumno)
     doc.moveDown();
     let y2=doc.y;

        doc.fontSize(14)
        .text('Fecha: '+fecha2)
        doc.x=350;
        doc.y=y2;
        doc.text('Hora: '+parte[0].hora)
        doc.x=30
        doc.text('Profesor/-a: '+parte[0].profesor)
        doc.x=30
        if (parte[0].grave==1){
          doc.text('TIPO DE PARTE: GRAVE');
        }else{
          doc.text('Tipo de parte: leve');
        }
        doc.x=30
       if (parte[0].convivencia==1){
        doc.fontSize(12);
        doc.text("La alumna/-o se ha derivado al aula de convivencia.")
       }else{
        doc.fontSize(12);
        doc.text("La alumna/-o ha permanecido en clase (no se ha derivado a convivencia).")
       }
       doc.moveDown();
       doc.fontSize(18)
       .fillColor('black')
       .text("Conductas tipificadas",{
        width:410,
        align:'center'
       })
       doc.moveDown();
       doc.fontSize(12);
       //Compruebo con variable que al menos una conducta se ha marcado
       let conducta=false;
       let cy2=doc.y;
       doc.moveDown();
       if (parte[0].faltaAsistencia==1){
        conducta=true;
        doc.text("- Falta de asistencia o puntualidad injustificada.",{
          align:'left'
        });
     
       }
       if (parte[0].desconsideracion==1){
        conducta=true;

        doc.text("- Desconsideración contra miembros de la comunidad escolar.",{
          align:'left'
        });
    
       }
       if (parte[0].interrumpeClase==1){
        conducta=true;

        doc.text("- Interrupción del desarrollo normal de las clases.",{
          align:'left'
        });
      }
        if (parte[0].alteraActividades==1){
          conducta=true;

          doc.text("- Alteración del desarrollo normal de las actividades del centro.",{
            align:'left'
          });
        }
        if (parte[0].conductasImpropias==1){
          conducta=true;

            doc.text("- Conductas impropias en un centro educativo.",{
              align:'left'
            });
          }
        if (parte[0].indisciplina==1){
          conducta=true;

              doc.text("- Actos de indisciplina contra miembros de la comunidad escolar.",{
                align:'left'
              });
              
       }
         if (parte[0].deterioroClase==1){
          conducta=true;

        doc.text("- El deterioro no grave, causado intencionadamente.",{
          align:'left'
        });
        
 }
        if (parte[0].deterioroPropiedades==1){
          conducta=true;

  doc.text("- El deterioro de propiedades y del material personal del profesorado o de compañeros.",{
    align:'left'
  });
  
}
        if (parte[0].usaAscensor==1){
          conducta=true;
  doc.text("- El uso inadecuado o sin autorización del ascensor.",{
    align:'left'
  });
  
}
if (parte[0].actoInjustificado==1){
  conducta=true;
  doc.fillColor('red').text("- Actos injustificados que perturben gravemente el normal desarrollo de las actividades del Centro. ",{
    align:'left'
  });
  
}
if (parte[0].indisciplinaGrave==1){
  conducta=true;
  doc.fillColor('red').text("- Actos de indisciplina, injuria u ofensas graves contra los miembros de la comunidad educativa. ",{
    align:'left'
  });
  
}
if (parte[0].perjuicioSalud==1){
  conducta=true;
  doc.fillColor('red').text("- Las actuaciones perjudiciales para la salud y la integridad personal de los miembros de la comunidad educativa del Centro, o la incitación a las mismas.",{
    align:'left'
  });
    
}
if (parte[0].agresionGrave==1){
  conducta=true;
  doc.fillColor('red').text("- La agresión grave física o moral contra miembros de la comunidad educativa o la discriminación grave.",{
    align:'left'
  });
    
}
if (parte[0].suplantacion==1){
  conducta=true;
  doc.fillColor('red').text("- La suplantación de personalidad en actos de la vida docente y la falsificación o sustracción de documentos académico. ",{
    align:'left'
  });
    
}
if (parte[0].danyoGrave==1){
  conducta=true;
  doc.fillColor('red').text("- Los daños graves causados por uso indebido o intencionadamente en los locales, material o documentación del Centro o en los bienes de otros miembros de la comunidad educativa.",{
    align:'left'
  });
    
}
if (parte[0].racista==1){
  conducta=true;
  doc.fillColor('red').text("- La exhibición de símbolos racistas, que inciten a la violencia, o de emblemas que atenten contra la dignidad de las personas y los derechos humanos. ",{
    align:'left'
  });
  
}
if (parte[0].reiteracion==1){
  conducta=true;
  doc.fillColor('red').text("- La reiteración, en un mismo curso escolar, de conductas contrarias a las normas de convivencia del Centro. ",{
    align:'left'
  });
  
}
if (parte[0].incumplimiento==1){
  conducta=true;
  doc.fillColor('red').text("- El incumplimiento de las sanciones impuestas. ",{
    align:'left'
  });
  
}
if (parte[0].abandonaCentro==1){
  conducta=true;
  doc.fillColor('red').text("- Abandonar el recinto escolar en horario lectivo sin permiso del Equipo Directivo y/o sin autorización de los padres o tutores legales.  ",{
    align:'left'
  });
  
}
if (parte[0].usaMovil==1){
  conducta=true;
  doc.fillColor('red').text("- Utilizar el teléfono móvil o dispositivo similar para tomar fotografías o grabar vídeos de cualquier miembro de la comunidad educativa, salvo que se haga con su consentimiento y con autorización del profesor/a para el uso de su asignatura.",{
    align:'left'
  });
  
}
if (parte[0].movilExamen==1){
  conducta=true;
  doc.fillColor('red').text("- El uso del móvil o dispositivo similar durante la realización de exámenes o pruebas de evaluación.  ",{
    align:'left'
  });
  
}
if (conducta==false){
  doc.text("- En este parte no se ha señalado ninguna conducta tipificada en las Normas de Convivencia")
}
doc.moveDown();
doc.rect(doc.x-10,cy2,520,doc.y-cy2).stroke();
doc.moveDown();

        doc
        .fontSize(18)
        .fillColor('black')
        .text("Descripción del comportamiento",{
        align:'center'})
        doc.moveDown();
        let cy=doc.y
        doc.moveDown();
        doc
        .fontSize(12)
        
        .text(parte[0].descripcion,{
          align: 'justify'
        })
        doc.moveDown();
        doc.rect(doc.x-10,cy,520,doc.y-cy).stroke();
        doc.moveDown();
        doc.x=30
        let y3=doc.y
        doc.text("Firma de la profesora/-or: ",{
          align:'left'
        })
        doc.x=400;
        doc.y=y3;
        doc.text("Firma de tutora/-or:",{
          align:'right'
        })
        
/*         if (parte[0].mantieneActitud==1 || parte[0].danyosMateriales==1 || parte[0].danyosPersonales==1){
          

          doc
          .fontSize(14)
          .text("HAY AGRAVANTES")
          doc 
          .fontSize(12)
          if (parte[0].mantieneActitud==1){
            doc
            .text("- Persiste en mantener actitud desafiante.")
          }
          if (parte[0].danyosMateriales==1){
            doc
            .text("- Se han producido daños materiales.")
          }
          if (parte[0].danyosPersonales==1){
            doc
            .text("- Uno o varios miembros de la comunidad educativa ha sufrido daños personales.")
          }
        }
        if (parte[0].reconoce==1 || parte[0].repara==1 || parte[0].primeraVez==1){
          

          doc
          .fontSize(14)
          .text("HAY ATENUANTES")
          doc 
          .fontSize(12)
          if (parte[0].reconoce==1){
            doc
            .text("- Reconoce su error y se disculpa por su comportamiento.")
          }
          if (parte[0].repara==1){
            doc
            .text("- Se compromete a reparar el daño causado")
          }
          if (parte[0].primeraVez==1){
            doc
            .text("- Es el primer parte disciplinario. Normalmente el alumno o alumna muestra buen comportamiento")
          }
        } */

      doc.end();
    })
}
function pdfGrupo(parte,archivo){
  let doc=new PDFDocument({size: 'A4'});
  doc.pipe(fs.createWriteStream(archivo));

 for (let i=0; i<parte[0].length;i++){
  for (let k=0;k<parte[0][i].length;k++){
doc.image(path.join(__dirname,'images/logoclm.png'), 100, 15, {width: 150}); 
doc.image(path.join(__dirname,'images/cofinanciado.png'), 300, 15, {width: 50}); 
doc.image(path.join(__dirname,'images/logoJuandeAvila.png'), 400, 15, {width: 50}); 
doc.image(path.join(__dirname,'images/logoAlfonsoX.png'), 500, 15, {width: 50}); 
let fecha=parte[0][i][k].fecha;
let dia=fecha.getDate();
let mes=fecha.getMonth()+1;
let anyo=fecha.getFullYear();
let fecha2=dia+'/'+mes+'/'+anyo;

doc
.fontSize(18)
.text('PARTE DISCIPLINARIO', 200, 80)
doc.x=30
doc.y=117
doc.fontSize(12)
.text('Alumno: '+parte[0][i][k].nombreT)
doc.moveDown();
let y2=doc.y;
doc.fontSize(14)
.text('Fecha: '+fecha2)
doc.x=350
doc.y=y2
doc.text('Hora: '+parte[0][i][k].hora)
doc.x=30
doc.text('Profesor/-a: '+parte[0][i][k].profesor)
doc.x=30
if (parte[0][i][k].grave==1){
  doc.text('TIPO DE PARTE: GRAVE');
}else{
  doc.text('Tipo de parte: leve');
}
doc.x=30
if (parte[0][i][k].convivencia==1){
  doc.fontSize(12);
  doc.text("La alumna/-o se ha derivado al aula de convivencia.")
 }else{
  doc.fontSize(12);
  doc.text("La alumna/-o ha permanecido en clase (no se ha derivado a convivencia).")
 }
 doc.moveDown();
 doc.fontSize(18)
 .fillColor('black')
 .text("Conductas tipificadas",{
  width:410,
  align:'center'
 })
 doc.moveDown();
 doc.fontSize(12);
 //Compruebo con variable que al menos una conducta se ha marcado
 let conducta=false;
 let cy2=doc.y;
 doc.moveDown();

 if (parte[0][i][k].faltaAsistencia==1){
  conducta=true;
  doc.text("- Falta de asistencia o puntualidad injustificada.",{
    align:'left'
  });

 }
 if (parte[0][i][k].desconsideracion==1){
  conducta=true;

  doc.text("- Desconsideración contra miembros de la comunidad escolar.",{
    align:'left'
  });

 }
 if (parte[0][i][k].interrumpeClase==1){
  conducta=true;

  doc.text("- Interrupción del desarrollo normal de las clases.",{
    align:'left'
  });
}
  if (parte[0][i][k].alteraActividades==1){
    conducta=true;

    doc.text("- Alteración del desarrollo normal de las actividades del centro.",{
      align:'left'
    });
  }
  if (parte[0][i][k].conductasImpropias==1){
    conducta=true;

      doc.text("- Conductas impropias en un centro educativo.",{
        align:'left'
      });
    }
  if (parte[0][i][k].indisciplina==1){
    conducta=true;

        doc.text("- Actos de indisciplina contra miembros de la comunidad escolar.",{
          align:'left'
        });
        
 }
   if (parte[0][i][k].deterioroClase==1){
    conducta=true;

  doc.text("- El deterioro no grave, causado intencionadamente.",{
    align:'left'
  });
  
}
  if (parte[0][i][k].deterioroPropiedades==1){
    conducta=true;

doc.text("- El deterioro de propiedades y del material personal del profesorado o de compañeros.",{
align:'left'
});

}
  if (parte[0][i][k].usaAscensor==1){
    conducta=true;
doc.text("- El uso inadecuado o sin autorización del ascensor.",{
align:'left'
});

}
if (parte[0][i][k].actoInjustificado==1){
conducta=true;
doc.fillColor('red').text("- Actos injustificados que perturben gravemente el normal desarrollo de las actividades del Centro. ",{
align:'left'
});

}
if (parte[0][i][k].indisciplinaGrave==1){
conducta=true;
doc.fillColor('red').text("- Actos de indisciplina, injuria u ofensas graves contra los miembros de la comunidad educativa. ",{
align:'left'
});

}
if (parte[0][i][k].perjuicioSalud==1){
conducta=true;
doc.fillColor('red').text("- Las actuaciones perjudiciales para la salud y la integridad personal de los miembros de la comunidad educativa del Centro, o la incitación a las mismas.",{
align:'left'
});

}
if (parte[0][i][k].agresionGrave==1){
conducta=true;
doc.fillColor('red').text("- La agresión grave física o moral contra miembros de la comunidad educativa o la discriminación grave.",{
align:'left'
});

}
if (parte[0][i][k].suplantacion==1){
conducta=true;
doc.fillColor('red').text("- La suplantación de personalidad en actos de la vida docente y la falsificación o sustracción de documentos académico. ",{
align:'left'
});

}
if (parte[0][i][k].danyoGrave==1){
conducta=true;
doc.fillColor('red').text("- Los daños graves causados por uso indebido o intencionadamente en los locales, material o documentación del Centro o en los bienes de otros miembros de la comunidad educativa.",{
align:'left'
});

}
if (parte[0][i][k].racista==1){
conducta=true;
doc.fillColor('red').text("- La exhibición de símbolos racistas, que inciten a la violencia, o de emblemas que atenten contra la dignidad de las personas y los derechos humanos. ",{
align:'left'
});

}
if (parte[0][i][k].reiteracion==1){
conducta=true;
doc.fillColor('red').text("- La reiteración, en un mismo curso escolar, de conductas contrarias a las normas de convivencia del Centro. ",{
align:'left'
});

}
if (parte[0][i][k].incumplimiento==1){
conducta=true;
doc.fillColor('red').text("- El incumplimiento de las sanciones impuestas. ",{
align:'left'
});

}
if (parte[0][i][k].abandonaCentro==1){
conducta=true;
doc.fillColor('red').text("- Abandonar el recinto escolar en horario lectivo sin permiso del Equipo Directivo y/o sin autorización de los padres o tutores legales.  ",{
align:'left'
});

}
if (parte[0][i][k].usaMovil==1){
conducta=true;
doc.fillColor('red').text("- Utilizar el teléfono móvil o dispositivo similar para tomar fotografías o grabar vídeos de cualquier miembro de la comunidad educativa, salvo que se haga con su consentimiento y con autorización del profesor/a para el uso de su asignatura.",{
align:'left'
});

}
if (parte[0][i][k].movilExamen==1){
conducta=true;
doc.fillColor('red').text("- El uso del móvil o dispositivo similar durante la realización de exámenes o pruebas de evaluación.  ",{
align:'left'
});

}
if (conducta==false){
doc.text("- En este parte no se ha señalado ninguna conducta tipificada en las Normas de Convivencia")
}
doc.moveDown();
doc.rect(doc.x-10,cy2,520,doc.y-cy2).stroke();
doc.moveDown();


doc
.fontSize(18)
.fill('black')
.text("Descripción del comportamiento",{
  align:"center"
})
doc.moveDown();
let cy=doc.y
doc.moveDown();
doc
.fontSize(12)

.text(parte[0][i][k].descripcion,{
  align: 'justify'
})
doc.rect(doc.x,cy,520,doc.y-cy).stroke();
doc.moveDown();
doc.x=30
       let y3=doc.y
        doc.text("Firma de la profesora/-or: ",{
          align:'left'
        })
        doc.y=y3;
        doc.x=400;
        doc.text("Firma de tutora/-or:")


  if (i<parte[0].length-1){
    doc.addPage();
  }
}
 }
 doc.end();
 }
 ipcMain.on('identificaProfe',function(event,profe){
  console.log(profe.nombre+", "+profe.NIF);
  db.dameDatos("SELECT * FROM profesores WHERE profesor='"+profe.nombre+"' AND clave='"+profe.NIF+"'").then((datos)=>{
if (datos.length==0){
  console.log("Identificación inválida")
  win.webContents.send("identificacionInvalida");
}else{
win.webContents.send("identificacionValida",profe);
console.log("Identificación válida")
}
  })
})