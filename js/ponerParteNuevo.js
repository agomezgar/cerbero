const ponerParte=document.getElementById('ponerParte');
const consultarPartes=document.getElementById('consultarPartes');
const pantallaPrincipal=document.getElementById('pantallaPrincipal');
const pantallaDatos=document.getElementById('pantallaDatos');
const fecha=document.getElementById('fecha');
const profesor=document.getElementById('profesor');
const hora=document.getElementById('hora');
const descripcion=document.getElementById('descripcion');

//Checkboxes que recogen faltas leves
const faltaAsistencia=document.getElementById('faltaAsistencia');
const desconsideracion=document.getElementById('desconsideracion');
const interrumpeClase=document.getElementById('interrumpeClase');
const alteraActividades=document.getElementById('alteraActividades');
const conductasImpropias=document.getElementById('conductasImpropias');
const indisciplina=document.getElementById('indisciplina');
const deterioroClase=document.getElementById('deterioroClase');
const deterioroPropiedades=document.getElementById('deterioroPropiedades');
const usaAscensor=document.getElementById('usaAscensor');

//Checkboxes que recogen faltas graves
const actoInjustificado=document.getElementById('actoInjustificado');
const indisciplinaGrave=document.getElementById('indisciplinaGrave');
const perjuicioSalud=document.getElementById('perjuicioSalud');
const agresionGrave=document.getElementById('agresionGrave');
const suplantacion=document.getElementById('suplantacion');
const danyoGrave=document.getElementById('danyoGrave');
const racista=document.getElementById('racista');
const reiteracion=document.getElementById('reiteracion');
const incumplimiento=document.getElementById('incumplimiento');
const abandonaCentro=document.getElementById('abandonaCentro');
const usaMovil=document.getElementById('usaMovil');
const movilExamen=document.getElementById('movilExamen');



/* const mantieneActitud=document.getElementById('mantieneActitud');
const danyosMateriales=document.getElementById('danyosMateriales');
const danyosPersonales=document.getElementById('danyosPersonales');
const reconoce=document.getElementById('reconoce');
const repara=document.getElementById('repara');
const primeraVez=document.getElementById('primeraVez'); */
const grabar=document.getElementById('grabar');
pantallaDatos.hidden=true;
const partesPrevios=document.getElementById('partesPrevios');
partesPrevios.hidden=true;
const numeroPartes=document.createElement("div");
const descripcionParte=document.createElement("div");
ponerParte.addEventListener('click',()=>{
    window.api.enviar("ponerParte");
    })
consultarPartes.addEventListener('click',()=>{
    window.api.enviar("consultarPartes")    })

const curso=document.getElementById("curso");
const nombreAlumno=document.getElementById("nombreAlumno");
//nombreAlumno.disabled=true;
//Rellenamos cursos
window.api.enviar("dameGrupos")
window.api.recibir("tomaGrupos",(datos)=>{
    for (let i=0;i<datos.length;i++){
        let valor=datos[i].GRUPO;
        let opcion=document.createElement("option")
        opcion.value=valor
        opcion.text=valor
        curso.appendChild(opcion)
    }
})
curso.addEventListener('change',()=>{
    let datos={
        "grupo" : curso.options[curso.selectedIndex].value,
        "valor": curso.selectedIndex

    }
    nombreAlumno.innerHTML="";
    window.api.enviar("dameAlumnos",datos);
    partesPrevios.hidden=true;
partesPrevios.innerHTML="";
numeroPartes.innerHTML="";
descripcionParte.innerHTML="";
})
window.api.recibir("tomaAlumnos",(datos)=>{
    let opcion=document.createElement("option");
    opcion.value="";
    opcion.text="";
    nombreAlumno.appendChild(opcion);
for (let i=0;i<datos.length;i++){
    let matricula=datos[i].ALUMNO;
    let nombre=datos[i].APELLIDOS+", "+datos[i].NOMBRE;
    let opcion=document.createElement("option");
    opcion.value=matricula;
    opcion.text=nombre;
    nombreAlumno.appendChild(opcion);
}
}) 
nombreAlumno.addEventListener('change',()=>{
    const parteLeve=document.getElementById("parteLeve")
    parteLeve.type="checkbox";
    parteLeve.checked=true;
    const parteGrave=document.getElementById("parteGrave");
    parteGrave.type="checkbox";
    parteGrave.checked=false;
    parteLeve.addEventListener('click',()=>{
        parteLeve.checked=true;
        parteGrave.checked=false;
    })
    parteGrave.addEventListener('click',()=>{
        parteGrave.checked=true;
        parteLeve.checked=false;
    })
    pantallaDatos.appendChild(document.createElement("br"));
pantallaDatos.hidden=false;   
partesPrevios.hidden=true;
partesPrevios.innerHTML="";
numeroPartes.innerHTML="";
descripcionParte.innerHTML="";
//Consultamos partes previos
window.api.enviar("damePartesPrevios",nombreAlumno.value);
})
grabar.addEventListener('click',()=>{
  let datos={
    "id":nombreAlumno.value,
    "nombre":nombreAlumno.options[nombreAlumno.selectedIndex].text,
    "fecha":fecha.value,
    "profesor":profesor.value,
    "hora":hora.value,
    "grave":parteGrave.checked,
    "convivencia":convivencia.checked,
    "descripcion":descripcion.value,
    "faltaAsistencia":faltaAsistencia.value,
    "desconsideracion":desconsideracion.value,
    "interrumpeClase":interrumpeClase.value,
    "alteraActividades":alteraActividades.value,
    "conductasImpropias":conductasImpropias.value,
    "indisciplina":indisciplina.value,
    "deterioroClase":deterioroClase.value,
    "deterioroPropiedades":deterioroPropiedades.value,
    "usaAscensor":usaAscensor.value,
    "actoInjustificado":actoInjustificado.value,
    "indisciplinaGrave":indisciplinaGrave.value,
    "perjuicioSalud":perjuicioSalud.value,
    "agresionGrave":agresionGrave.value,
    "suplantacion":suplantacion.value,
    "danyoGrave":danyoGrave.value,
    "racista":racista.value,
    "reiteracion":reiteracion.value,
    "incumplimiento":incumplimiento.value,
    "abandonaCentro":abandonaCentro.value,
    "usaMovil":usaMovil.value,
    "movilExamen":movilExamen.value
  }
  if (fecha.value==''||profesor.value==''||hora.value==''||descripcion.value==''){
    window.api.enviar("faltanDatos");
  }else{
    console.log("Aqui vale: "+datos.interrumpeClase)
window.api.enviar("grabaParte",datos);
  
pantallaDatos.hidden=true;
nombreAlumno.innerHTML="";
profesor.value="";
fecha.value="";
hora.value="";
parteLeve.checked=true;
parteGrave.checked=false;
descripcion.value="";
convivencia.checked=false;
desconsideracion.checked=false;
interrumpeClase.checked=false;
alteraActividades.checked=false;
conductasImpropias.checked=false;
indisciplina.checked=false;
deterioroClase.checked=false;
deterioroPropiedades.checked=false;
usaAscensor.checked=false;
actoInjustificado.checked=false;
indisciplinaGrave.checked=false;
perjuicioSalud.checked=false;
agresionGrave.checked=false;
suplantacion.checked=false;
danyoGrave.checked=false;
racista.checked=false;
reiteracion.checked=false;
incumplimiento.checked=false;
abandonaCentro.checked=false;
usaMovil.checked=false;
movilExamen.checked=false;
faltaAsistencia.checked=false;

curso.selectedIndex=0
partesPrevios.hidden=true;
numeroPartes.innerHTML="";
descripcionParte.innerHTML="";
  }
})
window.api.recibir("tomaPartes",(datos)=>{
    partesPrevios.hidden=false;

    partesPrevios.appendChild(numeroPartes);
    partesPrevios.appendChild(descripcionParte);

numeroPartes.innerHTML="";
descripcionParte.innerHTML="";

    //El alumno tiene otros partes
    if (datos.length!=0){
        numeroPartes.innerHTML="Número de partes: "+datos.length;
        let tablaPartes=document.createElement("table");
        tablaPartes.style.border="1px solid";
        descripcionParte.appendChild(tablaPartes);
        let filaDescripcion=document.createElement("tr")
        filaDescripcion.style.border="1px solid";
        let descripcionProfesor=document.createElement("td");
        let descripcionFecha=document.createElement("td");
        let descripcionGrave=document.createElement("td");
        let descripcionMotivo=document.createElement("td");
        descripcionProfesor.style.border="1px solid";
        descripcionFecha.style.border="1px solid";
        descripcionGrave.style.border="1px solid";
        descripcionMotivo.style.border="1px solid";
        descripcionProfesor.innerHTML="Profesor"
        descripcionFecha.innerHTML="Fecha";
        descripcionGrave.innerHTML="Parte grave";
        descripcionMotivo.innerHTML="Motivo del parte";
        tablaPartes.appendChild(filaDescripcion);
        filaDescripcion.appendChild(descripcionProfesor);
        filaDescripcion.appendChild(descripcionFecha);
        filaDescripcion.appendChild(descripcionGrave);
        filaDescripcion.appendChild(descripcionMotivo);
    for (let i=0;i<datos.length;i++){
        let fila=document.createElement("tr");
        fila.style.border="1px solid";
        tablaPartes.appendChild(fila);
        let profesorParte=document.createElement("td");
        profesorParte.style.border="1px solid";
        profesorParte.innerHTML=datos[i].profesor;
        fila.appendChild(profesorParte);
        let fechaParte=document.createElement("td");
        fechaParte.style.border="1px solid";
  
        fechaParte.innerHTML=datos[i].fecha;
        let mes=datos[i].fecha.getMonth()+1
        fechaParte.innerHTML=datos[i].fecha.getDate()+"/"+mes+"/"+datos[i].fecha.getFullYear();
        let fechaActual=new Date();
        let calculoFecha=(fechaActual.getTime()-datos[i].fecha.getTime())/(1000*3600*24);
        if (calculoFecha<90){
        fila.style.textDecorationLine='none'        
        }else{
            fila.style.textDecorationLine='line-through'        
        }
        fila.appendChild(fechaParte);
        let parteGrave=document.createElement("td");
        parteGrave.style.border="1px solid";

        if (datos[i].grave==0){
            parteGrave.innerHTML="No"
        }else{
            parteGrave.innerHTML="SÍ"
            fila.style.backgroundColor="red";
        }
        fila.appendChild(parteGrave);
        let descripcionMotivo=document.createElement("td");
        descripcionMotivo.style.border="1px solid";

        descripcionMotivo.innerHTML=datos[i].descripcion;
        fila.appendChild(descripcionMotivo);
        fila.addEventListener('click',()=>{
            console.log("Enviando orden de borrado..."+datos[i].id)
            window.api.enviar("borrarParte",datos[i]);
        })
    }
}
//El alumno no tiene partes previos
else{
    numeroPartes.appendChild(document.createTextNode("Este es el primer parte para la alumna/-o"))
} 
})
