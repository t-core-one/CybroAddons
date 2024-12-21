/** @odoo-module **/
import publicWidget from "@web/legacy/js/public/public_widget";

var count = 0;

document.addEventListener("keydown", function(event){
    if (event.key === "Delete" && window.canvas) {
        window.canvas.remove(window.canvas.getActiveObject());
    }
});

publicWidget.registry.canvasWidget = publicWidget.Widget.extend({
    selector: '#product_detail',
    events: {
        'change #product-design': '_onChangeSelect',
        'click .design_save': '_onSave',
        'click #product_customize_btn': '_addProductDesign',
    },
    _onChangeSelect: function() {
        if (typeof fabric === "undefined") {
            console.error("Fabric.js is not loaded");
            return;
        }
        var selectedOption = this.$el.find('#product-design').val().toString();
        var design_image = new Image();
        design_image.src = '/web/image/product.design/' + selectedOption + '/product_design';
        design_image.onload = function () {
            window.canvas = new fabric.Canvas('tshirt-canvas'); // Assign to window for global access
            var image = new fabric.Image(design_image);
            image.scaleToHeight(100);
            image.scaleToWidth(100);
            window.canvas.centerObject(image);
            window.canvas.add(image);
            window.canvas.renderAll();
        };
    },
    _onSave: function() {
        var node = document.querySelector('#tshirt-div');
        domtoimage.toPng(node).then(function (dataUrl) {
            var img = new Image();
            img.classList.add("design_image_doc");
            img.src = dataUrl;
            document.body.appendChild(img);
            alert('Saved your customized Image! Now you can add it to the cart.');
        });
    },
    _addProductDesign: function(ev) {
        count++;
        if (count % 2 === 0) {
            ev.target.offsetParent.nextElementSibling.classList.add("d-none");
        } else {
            ev.target.offsetParent.nextElementSibling.classList.remove("d-none");
        }
    },
});
