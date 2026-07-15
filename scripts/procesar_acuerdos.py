#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CívicosCR — Regenera src/data/acuerdos.json desde los archivos oficiales
de acuerdos del Concejo Municipal de Desamparados.

Uso:
    python3 scripts/procesar_acuerdos.py /ruta/a/carpeta [/otra/carpeta ...]

Lee todos los archivos `a*-AAAA*Acuerdos*.docx` de las carpetas indicadas,
extrae cada acuerdo (año, sesión, número, fecha, tema, texto resumido),
deduplica y escribe src/data/acuerdos.json.

Requiere: pip install python-docx
"""
import sys, re, glob, json, os
from collections import Counter, defaultdict

try:
    from docx import Document
except ImportError:
    sys.exit("Falta python-docx. Instalá con: pip install python-docx")

MESES = {'enero':'ene','febrero':'feb','marzo':'mar','abril':'abr','mayo':'may','junio':'jun',
         'julio':'jul','agosto':'ago','septiembre':'set','setiembre':'set','octubre':'oct',
         'noviembre':'nov','diciembre':'dic'}

TEMAS = {
  "Seguridad":       ['seguridad','polic[íi]a','vigilancia','c[áa]mara','delincuencia','criminalidad','oij'],
  "Vialidad y obras":['v[íi]a','camino','calle','asfalto','recarpeteo','puente','acera','alcantarillado','obra','mopt','8114','gesti[óo]n vial'],
  "Presupuesto":     ['presupuest','liquidaci[óo]n','modificaci[óo]n presupuestaria','partida'],
  "Contratación":    ['licitaci[óo]n','adjudica','contrataci[óo]n','contrato','compra'],
  "Social e inclusión":['adulto mayor','discapacidad','mujer','g[ée]nero','ni[ñn]ez','adolescen','cecudi','becas','j[óo]ven','juventud','social'],
  "Ambiente":        ['ambient','residuo','reciclaje','basura','r[íi]o','contaminaci[óo]n','reforestaci[óo]n','[áa]rea verde','parque'],
  "Reglamentos":     ['reglamento','normativa'],
  "Convenios":       ['convenio','alianza','cooperaci[óo]n','ifam','ministerio'],
  "Territorio":      ['plan regulador','uso de suelo','ordenamiento','territorial','zonificaci[óo]n'],
  "Cultura y deporte":['cultur','deport','banda','sinf[óo]nica','villa ol[íi]mpica','festival','recreaci[óo]n'],
  "Transparencia":   ['transparencia','auditor[íi]a','rendici[óo]n de cuentas','informaci[óo]n p[úu]blica','datos abiertos','derechos de autor','acam'],
  "Trámites internos":['aprobar el acta','juramenta','minuto de silencio','condolencia','fe de erratas'],
}

def clasificar(t):
    tl = t.lower()
    if 'aprobar el acta' in tl or 'juramenta' in tl:
        return "Trámites internos"
    p = {tema: sum(1 for k in kws if re.search(k, tl)) for tema, kws in TEMAS.items()}
    p = {k: v for k, v in p.items() if v}
    return max(p, key=p.get) if p else "Otros"

def fecha_de(bloque):
    m = re.search(r'celebrada.{0,120}?el\s+(?:\w+\s+){0,3}?(\d{1,2})\s+de\s+(\w+)\s+(?:del?\s+)?(\d{4})',
                  bloque, re.I | re.S)
    if m:
        return f"{int(m.group(1))} {MESES.get(m.group(2).lower(), m.group(2)[:3])} {m.group(3)}"
    return None

def main(carpetas):
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    salida = os.path.join(raiz, 'src', 'data', 'acuerdos.json')

    archivos = []
    for c in carpetas:
        archivos += glob.glob(os.path.join(c, "a*-202[0-9]*Acuerdos*.docx"))
    # Deduplicar variantes "(1)"
    base = {}
    for f in sorted(set(archivos)):
        clave = re.sub(r'\s*\(\d+\)', '', os.path.basename(f)).replace(', Acuerdos', ' Acuerdos')
        base.setdefault(clave, f)
    archivos = sorted(base.values())
    print(f"Archivos de acuerdos: {len(archivos)}")

    todos, vistos = [], set()
    for f in archivos:
        try:
            doc = Document(f)
            texto = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except Exception as e:
            print(f"  ! Error leyendo {f}: {e}")
            continue
        bloques = re.split(r'(CM-S[CM]-\d+-\d+-\d{4})', texto)
        for i in range(1, len(bloques) - 1, 2):
            oficio, cuerpo = bloques[i].strip(), bloques[i + 1]
            om = re.search(r'CM-S[CM]-(\d+)-(\d+)-(\d{4})', oficio)
            if not om:
                continue
            num_ac, sesion, anio = int(om.group(1)), int(om.group(2)), int(om.group(3))
            am = re.search(r'ACUERDA[NR]?\s*:?\s*(.{30,700}?)(?=[”"]\s*Acuerdo|Cordialmente|CM-S|$)',
                           cuerpo, re.I | re.S)
            if not am:
                continue
            cuerpo_a = re.sub(r'\s+', ' ', am.group(1)).replace('“', '"').replace('”', '"').strip(' ."')
            clave = (oficio, cuerpo_a[:100])
            if clave in vistos:
                continue
            vistos.add(clave)
            todos.append({"y": anio, "s": sesion, "n": num_ac, "f": fecha_de(cuerpo),
                          "t": clasificar(cuerpo_a), "x": cuerpo_a[:320]})

    # Propagar fecha dentro de cada sesión
    fechas = defaultdict(Counter)
    for a in todos:
        if a['f']:
            fechas[(a['y'], a['s'])][a['f']] += 1
    for a in todos:
        if not a['f'] and (a['y'], a['s']) in fechas:
            a['f'] = fechas[(a['y'], a['s'])].most_common(1)[0][0]

    todos.sort(key=lambda a: (-a['y'], -a['s'], a['n']))
    print(f"Acuerdos únicos: {len(todos)} — por año: {dict(sorted(Counter(a['y'] for a in todos).items()))}")

    json.dump({"nota": "Archivo completo de acuerdos extraídos de los documentos oficiales del Concejo Municipal. Texto resumido; el documento íntegro está en el portal de transparencia municipal.",
               "acuerdos": todos},
              open(salida, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f"✓ Escrito {salida}")
    print("Recordatorio: actualizá también las estadísticas de la radiografía en src/data/votaciones.json (campo stats).")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
