import os
import sys
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.slider import Slider
from kivy.uix.filechooser import FileChooserIconView
from kivy.uix.popup import Popup
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.core.window import Window
from kivy.clock import Clock
from kivy.graphics import Color, Rectangle, Line, Mesh

from database import DatabaseManager
from depth_engine import DepthEngine

Window.clearcolor = (0.02, 0.03, 0.06, 1)


class StudioScreen(Screen):
    def __init__(self, db_manager, **kwargs):
        super().__init__(**kwargs)
        self.db = db_manager
        self.current_image_path = None
        self.depth_scale = 1.0
        self.wireframe = False
        self.auto_rotate = True
        self.rotation_angle = 0

        self.build_ui()

    def build_ui(self):
        main_layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        # Header Bar
        header = BoxLayout(size_hint_y=None, height=50, spacing=10)
        title_label = Label(
            text='[b]DepthAR 3D Studio[/b]',
            markup=True,
            font_size='20sp',
            color=(0, 0.9, 0.8, 1)
        )
        header.add_widget(title_label)

        btn_gallery = Button(
            text='My DB Gallery',
            size_hint_x=None,
            width=120,
            background_color=(0.6, 0.3, 0.9, 1)
        )
        btn_gallery.bind(on_release=lambda x: self.goto_gallery())
        header.add_widget(btn_gallery)

        main_layout.add_widget(header)

        # 3D Viewport Box
        self.viewport = BoxLayout(size_hint_y=0.6)
        with self.viewport.canvas.before:
            Color(0.04, 0.05, 0.1, 1)
            self.viewport_bg = Rectangle(size=self.viewport.size, pos=self.viewport.pos)
        self.viewport.bind(size=self._update_bg, pos=self._update_bg)

        self.preview_label = Label(
            text='Upload a 2D Photo to Convert into 3D AR Model',
            color=(0.6, 0.7, 0.8, 1)
        )
        self.viewport.add_widget(self.preview_label)
        main_layout.add_widget(self.viewport)

        # Controls Deck
        controls = BoxLayout(orientation='vertical', size_hint_y=0.3, spacing=10)

        # Slider Box
        slider_box = BoxLayout(size_hint_y=None, height=40, spacing=10)
        slider_label = Label(text='Depth Scale:', size_hint_x=0.3, color=(0.8, 0.9, 1, 1))
        self.slider = Slider(min=0.1, max=3.0, value=1.0, size_hint_x=0.7)
        self.slider.bind(value=self.on_depth_change)
        slider_box.add_widget(slider_label)
        slider_box.add_widget(self.slider)
        controls.add_widget(slider_box)

        # Buttons Grid
        btn_grid = GridLayout(cols=3, spacing=10, size_hint_y=None, height=50)

        btn_upload = Button(text='Upload Image', background_color=(0, 0.7, 0.9, 1))
        btn_upload.bind(on_release=self.open_file_chooser)
        btn_grid.add_widget(btn_upload)

        btn_wireframe = Button(text='Wireframe', background_color=(0.2, 0.2, 0.4, 1))
        btn_wireframe.bind(on_release=self.toggle_wireframe)
        btn_grid.add_widget(btn_wireframe)

        btn_save = Button(text='Save to DB', background_color=(0, 0.9, 0.6, 1))
        btn_save.bind(on_release=self.save_to_database)
        btn_grid.add_widget(btn_save)

        controls.add_widget(btn_grid)
        main_layout.add_widget(controls)

        self.add_widget(main_layout)

    def _update_bg(self, instance, value):
        self.viewport_bg.pos = instance.pos
        self.viewport_bg.size = instance.size

    def open_file_chooser(self, instance):
        content = BoxLayout(orientation='vertical')
        filechooser = FileChooserIconView(path=os.path.expanduser('~'))
        content.add_widget(filechooser)

        btn_box = BoxLayout(size_hint_y=None, height=40, spacing=10)
        btn_select = Button(text='Select Photo')
        btn_cancel = Button(text='Cancel')
        btn_box.add_widget(btn_select)
        btn_box.add_widget(btn_cancel)
        content.add_widget(btn_box)

        popup = Popup(title='Choose a 2D Photo', content=content, size_hint=(0.9, 0.9))
        btn_cancel.bind(on_release=popup.dismiss)

        def select_file(btn):
            if filechooser.selection:
                self.load_image_and_convert(filechooser.selection[0])
                popup.dismiss()

        btn_select.bind(on_release=select_file)
        popup.open()

    def load_image_and_convert(self, path):
        self.current_image_path = path
        mesh_data = DepthEngine.process_image_to_mesh(path, target_width=60, depth_scale=self.depth_scale)

        self.viewport.clear_widgets()
        info_label = Label(
            text=f'Converted 3D Model: {os.path.basename(path)}\nGrid: {mesh_data["grid_size"][0]}x{mesh_data["grid_size"][1]} Vertices',
            color=(0, 0.9, 0.8, 1)
        )
        self.viewport.add_widget(info_label)

    def on_depth_change(self, instance, value):
        self.depth_scale = value
        if self.current_image_path:
            self.load_image_and_convert(self.current_image_path)

    def toggle_wireframe(self, instance):
        self.wireframe = not self.wireframe
        instance.background_color = (0, 0.9, 0.8, 1) if self.wireframe else (0.2, 0.2, 0.4, 1)

    def save_to_database(self, instance):
        if not self.current_image_path:
            popup = Popup(title='Info', content=Label(text='Please upload an image first!'), size_hint=(0.7, 0.3))
            popup.open()
            return

        model_id = self.db.save_model(
            title=os.path.basename(self.current_image_path),
            image_path=self.current_image_path,
            depth_scale=self.depth_scale,
            wireframe=1 if self.wireframe else 0
        )

        popup = Popup(
            title='Saved!',
            content=Label(text=f'3D Model saved to SQLite DB (ID #{model_id})'),
            size_hint=(0.7, 0.3)
        )
        popup.open()

    def goto_gallery(self):
        self.manager.current = 'gallery'


class GalleryScreen(Screen):
    def __init__(self, db_manager, **kwargs):
        super().__init__(**kwargs)
        self.db = db_manager
        self.build_ui()

    def on_enter(self):
        self.refresh_models()

    def build_ui(self):
        self.layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

        # Header
        header = BoxLayout(size_hint_y=None, height=50)
        title = Label(text='[b]Saved 3D Models Database[/b]', markup=True, font_size='18sp', color=(0.6, 0.3, 0.9, 1))
        btn_back = Button(text='Back to Studio', size_hint_x=None, width=120, background_color=(0, 0.7, 0.9, 1))
        btn_back.bind(on_release=lambda x: setattr(self.manager, 'current', 'studio'))

        header.add_widget(title)
        header.add_widget(btn_back)
        self.layout.add_widget(header)

        self.list_box = BoxLayout(orientation='vertical', spacing=10)
        self.layout.add_widget(self.list_box)

        self.add_widget(self.layout)

    def refresh_models(self):
        self.list_box.clear_widgets()
        models = self.db.get_all_models()

        if not models:
            self.list_box.add_widget(Label(text='No saved 3D models in SQLite database yet.', color=(0.6, 0.6, 0.6, 1)))
            return

        for m in models:
            row = BoxLayout(size_hint_y=None, height=50, padding=5, spacing=10)
            with row.canvas.before:
                Color(0.08, 0.1, 0.18, 1)
                Rectangle(size=row.size, pos=row.pos)

            lbl = Label(text=f'#{m["id"]} | {m["title"]} ({m["depth_scale"]}x depth)', color=(0.9, 0.9, 0.9, 1))
            btn_del = Button(text='Delete', size_hint_x=None, width=80, background_color=(0.9, 0.2, 0.2, 1))

            def make_delete_handler(model_id):
                return lambda x: self.delete_model(model_id)

            btn_del.bind(on_release=make_delete_handler(m['id']))

            row.add_widget(lbl)
            row.add_widget(btn_del)
            self.list_box.add_widget(row)

    def delete_model(self, model_id):
        self.db.delete_model(model_id)
        self.refresh_models()


class DepthARApp(App):
    def build(self):
        self.title = 'DepthAR Mobile App'
        self.db = DatabaseManager()

        sm = ScreenManager()
        sm.add_widget(StudioScreen(db_manager=self.db, name='studio'))
        sm.add_widget(GalleryScreen(db_manager=self.db, name='gallery'))

        return sm


if __name__ == '__main__':
    DepthARApp().run()
