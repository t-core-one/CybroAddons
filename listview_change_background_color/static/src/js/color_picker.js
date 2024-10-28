/** @odoo-module **/
import { patch } from "@web/core/utils/patch";
import { ListRenderer } from "@web/views/list/list_renderer";
import { ListController } from '@web/views/list/list_controller';
import { useService } from "@web/core/utils/hooks";

const { useRef, onPatched, onMounted, useState, onWillUpdateProps } = owl;

patch(ListRenderer.prototype, {
    setup() {
        if (this.constructor.name == 'SectionAndNoteListRenderer') {
        // Call method for removing color picking field from one2many
            onMounted(() => {
                this.__owl__.bdom.el.children[0].children[1].childNodes.forEach((item) => {
                    if (item.nodeName != "#text"){
                        if(!item.attributes.length == 0){
                            var list_one2many = item.children[1];
                            list_one2many.remove();
                        }
                    }
                })
            })
        }
        super.setup()
        this.orm = useService("orm");
        onMounted(this.color);
        if (this.constructor.name == 'SectionAndNoteListRenderer') {
        // Call method for removing color picking field from one2many
            onPatched(()=>{
                this.__owl__.bdom.el.children[0].children[1].childNodes.forEach((item) => {
                    if (item.nodeName != "#text"){
                        if(!item.attributes.length == 0){
                            var list_one2many = item.children[1];
                            list_one2many.remove();
                        }
                    }
                })
            });
        }
        onPatched(()=>{
            this.color()
        });
    },
    color_pick(ev, record) {
        var color = ev.target.value
        var res_id = record.resId
        var res_model = record.resModel

        // Update color picker input value
        ev.target.value = color;

        // ORM Call
        this.orm.call("color.picker", "get_color_picker_model_and_id", [], {
            record_id: res_id,
            model_name: res_model,
            record_color: color,
        }).then(function(data) {
            // You might want to handle the response here if needed
        })

        // Update row background color
        ev.target.closest('tr').style.backgroundColor = color;
    },

    color() {
        var current_model = this.props.list.model.env.searchModel.resModel
        var tr_list = document.getElementsByClassName('o_data_row')
        var self = this;

        this.orm.call("color.picker", "search_read", [], {
            domain: [
                ['res_model', '=', current_model],
            ],
        }).then(function(data) {
            Array.prototype.forEach.call(tr_list, function(tr) {
                data.forEach((item) => {
                    if (tr.firstChild.nextElementSibling.dataset.id == item.record_id) {
                        // Update row background color
                        tr.style.backgroundColor = item.color;

                        // Update color picker input value
                        let colorPicker = tr.querySelector('input[type="color"]');
                        if (colorPicker) {
                            colorPicker.value = item.color;
                        }
                    }
                });
            });
        })
    },
})
