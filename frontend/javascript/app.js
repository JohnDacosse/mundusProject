new Vue({
    el: '#app', // élément où s'applique la vue.
    data: { // Variables
        message:"Salut les gens",
        darkMode: false
    },
    methods: {// Méthodes
        truc: function() {
            // this.message = "Hola"
        },
        switchMode: function() {
            this.darkMode = !this.darkMode;
        }
    }
})