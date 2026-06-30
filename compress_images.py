import os
from PIL import Image

def optimize_png(file_path):
    try:
        original_size = os.path.getsize(file_path)
        with Image.open(file_path) as img:
            img.save(file_path, optimize=True, format="PNG")
        new_size = os.path.getsize(file_path)
        print(f"Optimized {os.path.basename(file_path)}: {original_size // 1024}KB -> {new_size // 1024}KB")
    except Exception as e:
        print(f"Failed to optimize {file_path}: {e}")

images = [
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\WorkHive.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\logo192.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\logo512.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\src\assets\backgroundlogin.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\Attendance.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\Dashboard.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\Employees.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\Home.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\Leave.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\Payroll.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\Performance.png",
    r"C:\Users\Fayiz\Desktop\WorkHive\frontend\public\assets\Profile.png",
]

for img in images:
    if os.path.exists(img):
        optimize_png(img)
