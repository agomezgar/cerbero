const ponerParte=document.getElementById('ponerParte');
ponerParte.disabled=true;
const consultarPartes=document.getElementById('consultarPartes');
consultarPartes.disabled=true;
const pantallaPrincipal=document.getElementById('pantallaPrincipal');
const pantallaActual=document.getElementById('pantallaActual');
const pantallaIdentificacion=document.getElementById('pantallaIdentificacion');
const identificacion=document.getElementById('identificacion');
const identificame=document.getElementById('identificame');
const profe=document.getElementById('profe');
const password=document.getElementById('password');
ponerParte.addEventListener('click',()=>{
window.api.enviar("ponerParte");
})
consultarPartes.addEventListener('click',()=>{
window.api.enviar("consultarPartes")    })

    identificame.addEventListener('click',()=>{
        let prof={
            "nombre":profe.value,
            "NIF":NIF.value
        }
        window.api.enviar("identificaProfe",prof);
    })
    identificame.addEventListener('click',()=>{
        let prof={
            "nombre":profe.value,
            "NIF":NIF.value
        }
        window.api.enviar("identificaProfe",prof);
    })
    window.api.recibir("identificacionInvalida",()=>{
        identificacion.innerHTML="Las iniciales o el NIF proporcionados no constan como válidos"
    })
    window.api.recibir("identificacionValida",(profe)=>{
        pantallaIdentificacion.innerHTML="";
        //ponerParte.disabled=false;
        consultarPartes.disabled=false;
        profesor=profe;
        console.log("Profesor identificado: "+profesor.nombre)
    })