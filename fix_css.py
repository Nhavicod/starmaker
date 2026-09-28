with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Find the second occurrence of "/* SIDE DOCK"
parts = content.split("/* SIDE DOCK ESTILO IPHONE VOLUMEN */")
if len(parts) > 2:
    # Retain the first one, but delete from the second one until the next </style>
    first_part = parts[0] + "/* SIDE DOCK ESTILO IPHONE VOLUMEN */" + parts[1]
    second_part = parts[2]
    # The second part ends at </style>
    end_of_css = second_part.find("</style>")
    if end_of_css != -1:
        second_part = second_part[end_of_css:] # Keep </style> and rest
    
    content = first_part + second_part

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

