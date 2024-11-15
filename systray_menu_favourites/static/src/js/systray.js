/** @odoo-module **/
import { useService, useBus } from "@web/core/utils/hooks";
import { Component, onWillStart, useRef, useState} from "@odoo/owl";
import { session } from "@web/session";
import { registry } from "@web/core/registry";
import { Dropdown } from "@web/core/dropdown/dropdown";

export class SystrayWidget extends Component {
    async setup() {
        super.setup(...arguments);
        this.state = useState({
            inputfield: false,
            searchInput: '',
            result: []
        });
        this.orm = useService('orm');
        this.action = useService("action");
        this.add_fav = useRef("add_fav")
        this.dropList = useRef("dropList")
    }
    // Show the input field
    async click_fav(ev){
        this.state.inputfield = true;
        this.add_fav.el.style.display='none'
    }
    // Show the dropdown list of all related menus, which retrieve from the corresponding model
    async _onClick(){
        var self = this;
        var input =  this.state.searchInput;
        this.state.result = await this.orm.call("ir.ui.menu", "search_read", [[['name', 'ilike', input],['action', '!=', null]]]);
        if (this.dropList.el) {
            this.dropList.el.style.display = 'block'
        }
    }
    //  Show the view when we click the button, the corresponding menu will show
    async click_view(menuId){
        var self = this
         this.orm.call('ir.ui.menu','search_views',[parseInt(menuId)]
        ).then(function (Result) {
            self.env.services.action.doAction({
                type: 'ir.actions.act_window',
                name: Result.name,
                res_model: Result.model,
                view_mode: Result.view_mode,
                views: [[false, 'list'], [false, 'form'], [false, 'kanban']],
                target: 'main',
            });
        });
        this.state.result = []
    }
    // To close the input field
    async _onClick_close(ev){
        this.state.inputfield = false;
        this.add_fav.el.style.display = 'block'
    }
    // To clear the input data
    async _onClick_clear(ev){
        this.state.searchInput = '';
        if (this.dropList.el) {
            this.dropList.el.style.display = 'none'
        }
    }
}
SystrayWidget.components = { Dropdown };
export const systrayItem = {
    Component: SystrayWidget,
};
SystrayWidget.template = "systray_menu_favourites.SystrayShortcut"
registry.category("systray").add("SystrayMenu", systrayItem, { sequence: 0 });
