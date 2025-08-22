const ponerParte=document.getElementById('ponerParte');
const consultarPartes=document.getElementById('consultarPartes');
const boton3=document.getElementById('boton3');
const pantallaPrincipal=document.getElementById('pantallaPrincipal');
let pantallaDatos=document.getElementById('pantallaDatos')
const consultaAlumno=document.getElementById('consultaAlumno');
const consultaGrupo=document.getElementById('consultaGrupo');
const curso=document.createElement("select");
const curso2=document.createElement("select");
const nombreAlumno=document.createElement("select");
const botones=document.getElementById("botones");
const partesPrevios=document.createElement("div");
let grupoActual='';
ponerParte.addEventListener('click',()=>{
    window.api.enviar("ponerParte");
    })
consultarPartes.addEventListener('click',()=>{
    window.api.enviar("consultarPartes")    })

consultaAlumno.addEventListener('click',()=>{
botones.appendChild(curso);
botones.appendChild(nombreAlumno);
curso2.hidden=true;
curso.hidden=false;
curso.selectedIndex=0;
nombreAlumno.hidden=true;
pantallaDatos.innerHTML="";
window.api.enviar("dameGrupos");
curso.addEventListener('change',()=>{
    let datos={
        "grupo" : curso.options[curso.selectedIndex].value,
        "valor": curso.selectedIndex

    }
    partesPrevios.innerHTML="";
    nombreAlumno.innerHTML="";
    nombreAlumno.hidden=false;
    window.api.enviar("dameAlumnos",datos);

})
})
consultaGrupo.addEventListener('click',()=>{
    curso2.innerHTML="";
    curso2.selectedIndex=0;
    curso2.hidden=false;
    botones.innerHTML="";
    botones.appendChild(curso2);
    nombreAlumno.innerHTML="";
    partesPrevios.innerHTML="";
    pantallaDatos.innerHTML="";
    window.api.enviar("dameGrupos");
    grupoActual='';
    curso2.addEventListener('change',()=>{
        pantallaDatos.innerHTML="";
        let datos={
            "grupo":curso2.options[curso2.selectedIndex].value,
            "valor": curso2.selectedIndex
        }
        grupoActual=curso2.options[curso2.selectedIndex].value
        window.api.enviar("damePartesGrupo",datos);
    })
})
window.api.recibir("tomaGrupos",(datos)=>{
    for (let i=0;i<datos.length;i++){
        let valor=datos[i].GRUPO;
        let opcion=document.createElement("option");
        let opcion2=document.createElement("option");
        opcion.value=valor;
        opcion.text=valor;
        opcion2.value=valor;
        opcion2.text=valor;
        curso.appendChild(opcion)
        curso2.appendChild(opcion2);
    }
})

window.api.recibir("tomaAlumnos",(datos)=>{
    nombreAlumno.innerHTML="";
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
    partesPrevios.innerHTML="";
    window.api.enviar("damePartesPrevios",nombreAlumno.value);
})
window.api.recibir("tomaPartes",(datos)=>{
   pantallaDatos.appendChild(partesPrevios);
    partesPrevios.hidden=false;
let numeroPartes=document.createElement("div");
let descripcionParte=document.createElement("div");
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
        let descripcionFecha=document.createElement("td");
        let descripcionGrave=document.createElement("td");
        let descripcionMotivo=document.createElement("td");
        let columnaBotonImprimir=document.createElement("td");
        descripcionFecha.style.border="1px solid";
        descripcionGrave.style.border="1px solid";
        descripcionMotivo.style.border="1px solid";
        //columnaBotonImprimir.style.border="1px solid";
        descripcionFecha.innerHTML="Fecha";
        descripcionGrave.innerHTML="Parte grave";
        descripcionMotivo.innerHTML="Motivo del parte";
        columnaBotonImprimir.innerHTML="Generar pdf";
        tablaPartes.appendChild(filaDescripcion);
        filaDescripcion.appendChild(descripcionFecha);
        filaDescripcion.appendChild(descripcionGrave);
        filaDescripcion.appendChild(descripcionMotivo);
        filaDescripcion.appendChild(columnaBotonImprimir);
    for (let i=0;i<datos.length;i++){
        
        let fila=document.createElement("tr");
        fila.style.border="1px solid";
        tablaPartes.appendChild(fila);
        let fechaParte=document.createElement("td");
        fechaParte.style.border="1px solid";
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
        let botonI=document.createElement("BUTTON");
        botonI.innerHTML="Ok";
        botonI.addEventListener('click',()=>{
            console.log("Clickando pdf")
            window.api.enviar("pdfIndividual",datos[i]);
        })
        fila.appendChild(botonI);
/*         fechaParte.addEventListener('dblclick',()=>{
            console.log("Enviando orden de borrado..."+datos[i].id)
            window.api.enviar("borrarParte",datos[i]);
        }) */
   
    }
}
//El alumno no tiene partes previos
else{
    numeroPartes.appendChild(document.createTextNode("La alumna/-o no tiene partes registrados"))
} 
})
window.api.recibir("tomaPartesGrupo",(datos2)=>{
    pantallaDatos.innerHTML="";
    let contador=0;
    let numPartes=document.createElement("div");
    pantallaDatos.appendChild(numPartes);
    let partesGrupo=document.createElement("div");
    pantallaDatos.appendChild(partesGrupo);
    console.log(datos2);
    if (datos2.length>0){

  let tablaPartes=document.createElement("table");
  tablaPartes.style.border="1px solid";
partesGrupo.appendChild(tablaPartes); 
  let filaTitulo=document.createElement("tr");
  tablaPartes.appendChild(filaTitulo);
  let tituloFecha=document.createElement("td");
  tituloFecha.style.border="1px solid";
  tituloFecha.innerHTML="Fecha: "
  filaTitulo.appendChild(tituloFecha)
  let tituloNombre=document.createElement("td");
  tituloNombre.style.border="1px solid"
  tituloNombre.innerHTML="Nombre de la alumna/-o: ";
  filaTitulo.appendChild(tituloNombre);
  let tituloProfesor=document.createElement("td");
  tituloProfesor.style.border="1px solid";
  tituloProfesor.innerHTML="Profesor/-a: ";
  filaTitulo.appendChild(tituloProfesor);
 
  let tituloGrave=document.createElement("td");
  tituloGrave.style.border="1px solid";
  tituloGrave.innerHTML="Parte grave: "
   filaTitulo.appendChild(tituloGrave);
   let tituloMotivo=document.createElement("td");
   tituloMotivo.style.border="1px solid";
   tituloMotivo.innerHTML="Motivo del parte: "
   filaTitulo.appendChild(tituloMotivo);
for (let i=0;i<datos2.length;i++){
    for (let k=0;k<datos2[i].length;k++){
        contador++;
        let filaNombre=document.createElement("tr");
        tablaPartes.appendChild(filaNombre);
        let fechaActual=new Date();
   
        let calculoFecha=(fechaActual.getTime()-datos2[i][k].fecha.getTime())/(1000*3600*24);
   
        if (calculoFecha<90){
    filaNombre.style.textDecorationLine='none'
        }else{
            filaNombre.style.textDecorationLine='line-through'

        }
        let colFecha=document.createElement("td");
        colFecha.style.border="1px solid";
        filaNombre.appendChild(colFecha);
        let mes=datos2[i][k].fecha.getMonth()+1
        colFecha.innerHTML=datos2[i][k].fecha.getDate()+"/"+mes+"/"+datos2[i][k].fecha.getFullYear();
        let nombreAl=document.createElement("td");
        nombreAl.style.border="1px solid";
        filaNombre.appendChild(nombreAl);
        nombreAl.innerHTML=datos2[i][k].nombreT;
        let nombrePro=document.createElement("td");
        nombrePro.style.border="1px solid";
        nombrePro.innerHTML=datos2[i][k].profesor;
        filaNombre.appendChild(nombrePro);
       
        let colGrave=document.createElement("td");
        colGrave.style.border="1px solid";
        filaNombre.appendChild(colGrave);
        if (datos2[i][k].grave==1){
            colGrave.innerHTML= "SÍ"
            filaNombre.style.backgroundColor="red";
        }else{
            colGrave.innerHTML="No"
        }
        let colMotivo=document.createElement("td");
        colMotivo.style.border="1px solid";
        filaNombre.appendChild(colMotivo);
        colMotivo.innerHTML=datos2[i][k].descripcion;
    }


}
numPartes.innerHTML="Total de partes registrados: "+contador
let botonGrabar=document.createElement("BUTTON");

botonGrabar.innerHTML="Imprimir informes";
partesGrupo.appendChild(botonGrabar);
botonGrabar.addEventListener('click',()=>{
let partes={};
partes=datos2;
    window.api.enviar("imprimePartesGrupo",[partes,grupoActual]);
})
    }else{
        pantallaDatos.innerHTML="No hay partes registrados en este grupo";
    }
})