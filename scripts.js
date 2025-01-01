// ======================================================
// = LÓGICA DE CAMBIO DE IDIOMA (placeholders, textos) =
// ======================================================

/**
 * Función para hacer scroll hasta la sección de contacto.
 * Se utiliza en el botón "Contáctanos" en index.html
 */
function scrollToContact() {
    document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
  }
  
  // Esperamos a que el DOM cargue para asegurar que los elementos existen.
  document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------
    // 1. Manejo de idiomas
    // -----------------------------
    const languageSelector = document.getElementById("languageSelector");
    const allLangElements = document.querySelectorAll("[class^='lang-']");
  
    // Campos a traducir el placeholder
    const placeholderFields = document.querySelectorAll(".placeholder-field");
  
    // Detectamos cambio de idioma en el <select>
    languageSelector.addEventListener("change", function() {
      const selectedLang = this.value;
  
      // Mostrar solo los elementos del idioma seleccionado y ocultar los demás
      allLangElements.forEach(el => {
        el.style.display = el.classList.contains(`lang-${selectedLang}`) ? "" : "none";
      });
  
      // Actualizar los placeholders según el idioma
      placeholderFields.forEach(field => {
        const placeholderText = field.getAttribute(`data-placeholder-${selectedLang}`);
        field.placeholder = placeholderText || "";
      });
    });
  
    // Forzamos que aparezca el idioma por defecto (Neerlandés) al cargar
    languageSelector.value = "nl";
    languageSelector.dispatchEvent(new Event("change"));
  
    // -----------------------------
    // 2. Configuración intl-tel-input
    // -----------------------------
    const phoneInput = document.querySelector("#phone");
  
    // Inicializa la librería con la configuración deseada
    const iti = window.intlTelInput(phoneInput, {
      initialCountry: "nl",         // País inicial: Países Bajos
      separateDialCode: true,       // Muestra el prefijo separado
      autoPlaceholder: "aggressive" // Placeholder dinámico
      // preferredCountries: ["nl", "es", "gb", "cz"], // Ejemplo opcional
    });
  
    // -----------------------------
    // 3. Envío de datos a Telegram
    // -----------------------------
    const contactForm = document.getElementById("contactForm");
  
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
      
        // Obtenemos las referencias de los campos
        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const messageInput = document.getElementById("message");
      
        // Librería intl-tel-input sobre phoneInput
        const phoneInput = document.querySelector("#phone");
        const iti = window.intlTelInput(phoneInput, {
            initialCountry: "nl",
            separateDialCode: true,
            autoPlaceholder: "aggressive"
        });


        const plainPhoneNumber = iti.k.innerText + toString(phoneInput.value); // Ej.: "+31 6 12345678"

        // Accedemos al div de error
        const errorDiv = document.getElementById("errorMessage");
        errorDiv.style.display = "none";
        errorDiv.innerText = "";
      
        // Primero, eliminamos las clases de error anteriores
        [nameInput, emailInput, phoneInput, messageInput].forEach(field => {
          field.classList.remove("error-field");
        });
      
        // Array para guardar los campos que fallan
        let hasErrors = false;
        const failingFields = []; // Aquí iremos agregando { field: '...', value: '...' }
      
        // 1) Nombre
        if (!nameInput.value.trim()) {
          nameInput.classList.add("error-field");
          hasErrors = true;
          failingFields.push({ field: 'Nombre', value: nameInput.value });
        }
      
        // 2) Email
        if (!emailInput.value.trim()) {
          emailInput.classList.add("error-field");
          hasErrors = true;
          failingFields.push({ field: 'Email', value: emailInput.value });
        }
      
        // 3) Teléfono
        if (!plainPhoneNumber || plainPhoneNumber.trim() === "") {
          phoneInput.classList.add("error-field");
          hasErrors = true;
          failingFields.push({ field: 'Teléfono', value: plainPhoneNumber });
        }
      
        // 4) Mensaje
        if (!messageInput.value.trim()) {
          messageInput.classList.add("error-field");
          hasErrors = true;
          failingFields.push({ field: 'Mensaje', value: messageInput.value });
        }
      
        // Si hay errores, mostramos mensaje y detenemos el envío
        if (hasErrors) {
          // Mensaje en pantalla
          errorDiv.innerText = "Por favor, completa los campos marcados en rojo.";
          errorDiv.style.display = "block";
      
          // Mensaje en consola
          console.log("Campos que no se han completado correctamente:");
          failingFields.forEach(item => {
            console.log(`${item.field} => Valor actual: "${item.value}"`);
          });
      
          return;
        }
      
        // -----------------------------
        // Si llegamos aquí, todos los campos están rellenados
        // Realizamos el envío a Telegram o la acción que corresponda
        // -----------------------------
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
      
        // Construimos el texto a enviar por Telegram
        const telegramMessage = `
          Nuevo contacto:
          - Nombre: ${name}
          - Email: ${email}
          - Teléfono: ${plainPhoneNumber}
          - Mensaje: ${message}
        `;
      
        // Llamada a la API de Telegram (token y chat_id de ejemplo)
        fetch(`https://api.telegram.org/bot123456789/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "123456",
            text: telegramMessage
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.ok) {
              alert("¡Mensaje enviado con éxito!");
              contactForm.reset();
              iti.setNumber("");
            } else {
              alert("Error al enviar el mensaje. Inténtalo de nuevo más tarde.");
            }
          })
          .catch(err => {
            console.error(err);
            alert("Ocurrió un error al enviar los datos. Por favor, inténtalo de nuevo.");
          });
      });
      
  });
  