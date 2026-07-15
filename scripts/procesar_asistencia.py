#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CívicosCR — Regenera src/data/asistencia.json desde las actas completas
de las sesiones del Concejo Municipal de Desamparados.

Uso:
    python3 scripts/procesar_asistencia.py /ruta/a/actas [/otra/ruta ...]

Lee todos los archivos `Acta no. N-AAAA.docx`, extrae la lista de personas
ausentes que registra la Secretaría en el capítulo de comprobación de
asistencia, cruza los nombres con la integración del Concejo definida en
src/data/concejo.json y escribe src/data/asistencia.json.

Requiere: pip install python-docx
"""
import sys, re, glob, json, os
from collections import defaultdict, Counter

try:
    from docx import Document
except ImportError:
    sys.exit("Falta python-docx. Instalá con: pip install python-docx")

# Sindicaturas propietarias (una por distrito). Si cambia la integración,
# actualizá esta lista con la cabecera de cualquier acta reciente.
SINDICOS_PROP = [
    "Javier Alberto Muñoz Segura", "Evelio Segura Chacón", "José Antonio Chavarría Arce",
    "Sara Isela Mora Salazar", "Said Enrique López Calvo", "Alice Quirós Calvo",
    "Laura González Villalobos", "Emmanuel Eduardo Vega Serrano", "Wendy Vanessa Carvajal Ureña",
    "Marino Cristóbal Pérez Guzmán", "Lizandro David Porras Calderón", "Julieth Mariam Rodríguez Mora",
    "Fausto Javier Montes Chinchilla",
]

def main(carpetas):
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    salida = os.path.join(raiz, 'src', 'data', 'asistencia.json')
    concejo = json.load(open(os.path.join(raiz, 'src', 'data', 'concejo.json'), encoding='utf-8'))

    roster = {}
    for r in concejo['regidores']:
        roster[r['nombre']] = ("Regiduría propietaria", r['partido'])
    for s in concejo['suplentes']:
        roster[s['nombre']] = ("Regiduría suplente", s['partido'])
    for s in SINDICOS_PROP:
        roster[s] = ("Sindicatura propietaria", None)

    def match(nombre):
        tn = set(nombre.lower().split())
        mejor, mejor_score = None, 0
        for base in roster:
            tb = set(base.lower().split())
            score = len(tn & tb)
            if score > mejor_score and score >= min(3, len(tb)):
                mejor, mejor_score = base, score
        return mejor

    # Recolectar actas, deduplicando variantes "(1)"
    archivos = []
    for c in carpetas:
        archivos += glob.glob(os.path.join(c, "Acta no. *.docx"))
    base = {}
    for f in sorted(set(archivos)):
        base.setdefault(re.sub(r'\s*\(\d+\)', '', os.path.basename(f)), f)
    actas = sorted(base.values())
    print(f"Actas completas únicas: {len(actas)}")

    registros = []
    for f in actas:
        m = re.search(r'Acta no\.\s*(\d+)-(\d{4})', os.path.basename(f))
        if not m:
            continue
        sesion, anio = int(m.group(1)), int(m.group(2))
        try:
            doc = Document(f)
            t = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except Exception as e:
            print(f"  ! Error leyendo {f}: {e}")
            continue
        am = re.search(r'las personas ausentes son\s*:?\s*(.{5,400}?)(?:\.|\n|CAP[IÍ]TULO)', t, re.I | re.S)
        if am:
            nombres = [n.strip(' .;') for n in re.split(r',| y ', am.group(1)) if len(n.strip()) > 8]
            registros.append((anio, sesion, nombres))
        elif re.search(r'comprobaci[óo]n de asistencia', t, re.I):
            registros.append((anio, sesion, []))  # sin ausentes = asistencia completa

    cobertura = dict(sorted(Counter(str(r[0]) for r in registros).items()))
    print(f"Sesiones con registro: {len(registros)} — {cobertura}")

    ausencias = defaultdict(lambda: defaultdict(int))
    for anio, sesion, nombres in registros:
        for n in nombres:
            n = re.sub(r'\s+', ' ', n).strip()
            base_n = match(n) or n
            ausencias[base_n][str(anio)] += 1

    personas = []
    for nombre, por_anio in ausencias.items():
        cargo, partido = roster.get(nombre, ("Sindicatura suplente / otros", None))
        personas.append({"nombre": nombre, "cargo": cargo, "partido": partido,
                         "ausencias": dict(sorted(por_anio.items())),
                         "total": sum(por_anio.values())})
    for nombre, (cargo, partido) in roster.items():
        if not any(p['nombre'] == nombre for p in personas):
            personas.append({"nombre": nombre, "cargo": cargo, "partido": partido,
                             "ausencias": {}, "total": 0})
    personas.sort(key=lambda p: (-p['total'], p['nombre']))

    json.dump({
        "nota": "Ausencias registradas literalmente por la Secretaría del Concejo en el capítulo de comprobación de asistencia de cada acta. Una ausencia puede estar justificada (salud, licencia u otras razones) y las suplencias operan para mantener el cuórum: este registro no es un juicio, es el dato público tal como consta en actas.",
        "cobertura": cobertura,
        "total_sesiones": len(registros),
        "fuente": "Actas de las sesiones del Concejo Municipal de Desamparados (portal de transparencia municipal)",
        "personas": personas
    }, open(salida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f"✓ Escrito {salida}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
