# -*- coding: utf-8 -*-
###############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#
#    Copyright (C) 2024-TODAY Cybrosys Technologies(<https://www.cybrosys.com>)
#    Author: Aysha Shalin (odoo@cybrosys.com)
#
#    You can modify it under the terms of the GNU AFFERO
#    GENERAL PUBLIC LICENSE (AGPL v3), Version 3.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU AFFERO GENERAL PUBLIC LICENSE (AGPL v3) for more details.
#
#    You should have received a copy of the GNU AFFERO GENERAL PUBLIC
#    LICENSE (AGPL v3) along with this program.
#    If not, see <http://www.gnu.org/licenses/>.
#
###############################################################################
{
    'name': "Equipment Request & IT Operation",
    'version': "18.0.1.0.0",
    'category': 'Human Resources',
    'summary': """This module helps to Create Equipment Requests.""",
    'description': """This module allows employees to send equipment requests
    and equipment damage expense reimbursement requests to the Department
    Manager of Equipments. The workflow requires approval from the Department
    Manager, followed by approval from the HR Officer for both equipment
    requests and damage reimbursement requests.""",
    'author': 'Cybrosys Techno Solutions',
    'company': 'Cybrosys Techno Solutions',
    'maintainer': 'Cybrosys Techno Solutions',
    'website': 'https://www.cybrosys.com',
    'depends': ['base', 'hr_expense', 'hr', 'stock', 'account'],
    'data': [
        'security/ir.model.access.csv',
        'security/user_groups.xml',
        'views/equipment_request_views.xml',
        'report/equipment_report.xml',
        'report/equipment_report_template.xml',
        'views/menu_action.xml',
    ],
    'images': ['static/description/banner.png'],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
