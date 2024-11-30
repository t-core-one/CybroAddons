/** @odoo-module **/
import { rpc } from "@web/core/network/rpc";
import publicWidget from "@web/legacy/js/public/public_widget";
import animations from "@website/js/content/snippets.animation";

publicWidget.registry.AskedQuestions = animations.Animation.extend({
   selector: '.faq',
   start: async function () {
    await this._super(...arguments);
    // To get data from controller.
    var self = this;
    await rpc('/get_asked_questions', {}).then((data) => {
      if (data) {
        self.$target.html(data);
      }
    });
  },
});
