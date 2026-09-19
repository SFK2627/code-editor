(() => {
  'use strict';

  if (window.ICT8PinoyFeudQuestions) return;

  const Q = [
    {
      "id": "school-dala-curated",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng estudyante sa school.",
      "answers": [
        {
          "text": "Cellphone",
          "points": 30,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "selpon",
            "smartphone"
          ]
        },
        {
          "text": "Ballpen",
          "points": 22,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 17,
          "aliases": [
            "kuwaderno",
            "kwaderno",
            "notebook"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig / tumbler",
            "tumbler",
            "water bottle"
          ]
        },
        {
          "text": "Bag",
          "points": 10,
          "aliases": [
            "backpack",
            "bag",
            "school bag"
          ]
        },
        {
          "text": "Baon / Pagkain",
          "points": 8,
          "aliases": [
            "baon",
            "baon / pagkain",
            "food",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "teacher-lines-curated",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang linyang madalas marinig ng estudyante mula sa teacher?",
      "answers": [
        {
          "text": "Pass your papers",
          "points": 28,
          "aliases": [
            "pasa papel",
            "pass your papers",
            "submit your paper"
          ]
        },
        {
          "text": "Tumahimik / Be quiet",
          "points": 21,
          "aliases": [
            "be quiet",
            "quiet",
            "silence",
            "tumahimik / be quiet"
          ]
        },
        {
          "text": "Any questions?",
          "points": 17,
          "aliases": [
            "any questions?",
            "may tanong",
            "questions"
          ]
        },
        {
          "text": "Open your book",
          "points": 14,
          "aliases": [
            "buksan libro",
            "open book",
            "open your book"
          ]
        },
        {
          "text": "Makinig nang mabuti",
          "points": 11,
          "aliases": [
            "listen carefully",
            "makinig",
            "makinig nang mabuti"
          ]
        },
        {
          "text": "Group yourselves",
          "points": 9,
          "aliases": [
            "form a group",
            "group yourselves",
            "mag-group"
          ]
        }
      ]
    },
    {
      "id": "fiesta-sounds-curated",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang madalas makita o marinig kapag may fiesta sa barangay?",
      "answers": [
        {
          "text": "Maraming pagkain",
          "points": 32,
          "aliases": [
            "food",
            "handa",
            "maraming pagkain"
          ]
        },
        {
          "text": "Videoke / Karaoke",
          "points": 20,
          "aliases": [
            "karaoke",
            "videoke",
            "videoke / karaoke"
          ]
        },
        {
          "text": "Band / Musika",
          "points": 16,
          "aliases": [
            "band",
            "band / musika",
            "music"
          ]
        },
        {
          "text": "Parade / Prusisyon",
          "points": 12,
          "aliases": [
            "parade",
            "parade / prusisyon",
            "prusisyon"
          ]
        },
        {
          "text": "Paligsahan / Games",
          "points": 11,
          "aliases": [
            "contest",
            "games",
            "paligsahan / games"
          ]
        },
        {
          "text": "Dekorasyon / Bandera",
          "points": 9,
          "aliases": [
            "bandera",
            "decorations",
            "dekorasyon / bandera"
          ]
        }
      ]
    },
    {
      "id": "school-bag-1",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag papasok sa school.",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-2",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang karaniwang nasa bag kapag papasok sa school?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-3",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag papasok sa school?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang importanteng bitbit kapag papasok sa school?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-5",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang unang hinahanap bago umalis kapag papasok sa school?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-6",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng gamit na laging kasama kapag papasok sa school.",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na dala ng tao kapag papasok sa school?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag papasok sa school?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-9",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas kailanganin kapag papasok sa school?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "school-bag-10",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag papasok sa school?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 30,
          "aliases": [
            "ballpen",
            "bolpen",
            "pen"
          ]
        },
        {
          "text": "Notebook",
          "points": 22,
          "aliases": [
            "kwaderno",
            "notebook",
            "notebook paper"
          ]
        },
        {
          "text": "Cellphone",
          "points": 17,
          "aliases": [
            "cellphone",
            "cp",
            "phone",
            "smartphone"
          ]
        },
        {
          "text": "Tubig / Tumbler",
          "points": 13,
          "aliases": [
            "tubig",
            "tubig / tumbler",
            "water bottle"
          ]
        },
        {
          "text": "ID",
          "points": 10,
          "aliases": [
            "id",
            "id card",
            "school id"
          ]
        },
        {
          "text": "Baon / Pera",
          "points": 8,
          "aliases": [
            "allowance",
            "baon",
            "baon / pera",
            "money"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-1",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag pupunta sa beach.",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-2",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang karaniwang nasa bag kapag pupunta sa beach?",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-3",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag pupunta sa beach?",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-4",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang importanteng bitbit kapag pupunta sa beach?",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-5",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang unang hinahanap bago umalis kapag pupunta sa beach?",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-6",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng gamit na laging kasama kapag pupunta sa beach.",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-7",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang common na dala ng tao kapag pupunta sa beach?",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-8",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag pupunta sa beach?",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-9",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas kailanganin kapag pupunta sa beach?",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "beach-trip-10",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag pupunta sa beach?",
      "answers": [
        {
          "text": "Pamalit na damit",
          "points": 28,
          "aliases": [
            "clothes",
            "extra clothes",
            "pamalit na damit"
          ]
        },
        {
          "text": "Towel",
          "points": 21,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Sunblock",
          "points": 17,
          "aliases": [
            "sunblock",
            "sunscreen"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 14,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Pagkain / Snacks",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / snacks",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "road-trip-1",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag may long road trip.",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-2",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang karaniwang nasa bag kapag may long road trip?",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-3",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag may long road trip?",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-4",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang importanteng bitbit kapag may long road trip?",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-5",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang unang hinahanap bago umalis kapag may long road trip?",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-6",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng gamit na laging kasama kapag may long road trip.",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-7",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang common na dala ng tao kapag may long road trip?",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-8",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag may long road trip?",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-9",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas kailanganin kapag may long road trip?",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "road-trip-10",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag may long road trip?",
      "answers": [
        {
          "text": "Tubig",
          "points": 32,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "food",
            "pagkain",
            "snacks"
          ]
        },
        {
          "text": "Cellphone",
          "points": 16,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Power bank",
          "points": 12,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        },
        {
          "text": "Wallet / Pera",
          "points": 11,
          "aliases": [
            "money",
            "wallet",
            "wallet / pera"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 9,
          "aliases": [
            "pillow / unan",
            "travel pillow",
            "unan"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-1",
      "category": "SPORTS & FUN",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag may basketball game.",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-2",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang karaniwang nasa bag kapag may basketball game?",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-3",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag may basketball game?",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-4",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang importanteng bitbit kapag may basketball game?",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-5",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang unang hinahanap bago umalis kapag may basketball game?",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-6",
      "category": "SPORTS & FUN",
      "prompt": "Magbanggit ng gamit na laging kasama kapag may basketball game.",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-7",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang common na dala ng tao kapag may basketball game?",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-8",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag may basketball game?",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-9",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang madalas kailanganin kapag may basketball game?",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "basketball-game-10",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag may basketball game?",
      "answers": [
        {
          "text": "Tubig",
          "points": 27,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Jersey / Damit",
          "points": 22,
          "aliases": [
            "jersey",
            "jersey / damit",
            "sportswear"
          ]
        },
        {
          "text": "Sapatos",
          "points": 18,
          "aliases": [
            "rubber shoes",
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Tuwalya",
          "points": 13,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Ball",
          "points": 11,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Extra shirt",
          "points": 9,
          "aliases": [
            "extra shirt",
            "pamaling damit",
            "shirt"
          ]
        }
      ]
    },
    {
      "id": "ulan-1",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag tag-ulan.",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-2",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang karaniwang nasa bag kapag tag-ulan?",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-3",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag tag-ulan?",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-4",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang importanteng bitbit kapag tag-ulan?",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-5",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang unang hinahanap bago umalis kapag tag-ulan?",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-6",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Magbanggit ng gamit na laging kasama kapag tag-ulan.",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-7",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang common na dala ng tao kapag tag-ulan?",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-8",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag tag-ulan?",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-9",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang madalas kailanganin kapag tag-ulan?",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "ulan-10",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag tag-ulan?",
      "answers": [
        {
          "text": "Payong",
          "points": 29,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Jacket / Hoodie",
          "points": 21,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Extra damit",
          "points": 16,
          "aliases": [
            "clothes",
            "extra damit",
            "pamaling damit"
          ]
        },
        {
          "text": "Panyo / Towel",
          "points": 13,
          "aliases": [
            "panyo",
            "panyo / towel",
            "towel"
          ]
        },
        {
          "text": "Tsinelas",
          "points": 12,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Cellphone",
          "points": 9,
          "aliases": [
            "cellphone",
            "phone"
          ]
        }
      ]
    },
    {
      "id": "exam-day-1",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag exam day.",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-2",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang karaniwang nasa bag kapag exam day?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-3",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag exam day?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang importanteng bitbit kapag exam day?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-5",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang unang hinahanap bago umalis kapag exam day?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-6",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng gamit na laging kasama kapag exam day.",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na dala ng tao kapag exam day?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag exam day?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-9",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas kailanganin kapag exam day?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "exam-day-10",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag exam day?",
      "answers": [
        {
          "text": "Ballpen",
          "points": 26,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Pencil",
          "points": 22,
          "aliases": [
            "lapis",
            "pencil"
          ]
        },
        {
          "text": "Calculator",
          "points": 18,
          "aliases": [
            "calc",
            "calculator"
          ]
        },
        {
          "text": "Permit / ID",
          "points": 14,
          "aliases": [
            "id",
            "permit",
            "permit / id"
          ]
        },
        {
          "text": "Reviewer / Notes",
          "points": 12,
          "aliases": [
            "notes",
            "reviewer",
            "reviewer / notes"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-1",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag may online class.",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-2",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang karaniwang nasa bag kapag may online class?",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-3",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag may online class?",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-4",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang importanteng bitbit kapag may online class?",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-5",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang unang hinahanap bago umalis kapag may online class?",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-6",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng gamit na laging kasama kapag may online class.",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-7",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang common na dala ng tao kapag may online class?",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-8",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag may online class?",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-9",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang madalas kailanganin kapag may online class?",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "online-class-10",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag may online class?",
      "answers": [
        {
          "text": "Cellphone / Laptop",
          "points": 30,
          "aliases": [
            "cellphone / laptop",
            "computer",
            "laptop",
            "phone"
          ]
        },
        {
          "text": "Internet / Data",
          "points": 22,
          "aliases": [
            "data",
            "internet / data",
            "wifi"
          ]
        },
        {
          "text": "Charger",
          "points": 17,
          "aliases": [
            "charger",
            "charging cable"
          ]
        },
        {
          "text": "Earphones / Headset",
          "points": 13,
          "aliases": [
            "earphones",
            "earphones / headset",
            "headset"
          ]
        },
        {
          "text": "Notebook / Pen",
          "points": 10,
          "aliases": [
            "notebook",
            "notebook / pen",
            "notes",
            "pen"
          ]
        },
        {
          "text": "Tubig",
          "points": 8,
          "aliases": [
            "tubig",
            "water"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-1",
      "category": "PINOY CULTURE",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag magsi-Simbang Gabi.",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-2",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang karaniwang nasa bag kapag magsi-Simbang Gabi?",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-3",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag magsi-Simbang Gabi?",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-4",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang importanteng bitbit kapag magsi-Simbang Gabi?",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-5",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang unang hinahanap bago umalis kapag magsi-Simbang Gabi?",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-6",
      "category": "PINOY CULTURE",
      "prompt": "Magbanggit ng gamit na laging kasama kapag magsi-Simbang Gabi.",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-7",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang common na dala ng tao kapag magsi-Simbang Gabi?",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-8",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag magsi-Simbang Gabi?",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-9",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang madalas kailanganin kapag magsi-Simbang Gabi?",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "simbang-gabi-10",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag magsi-Simbang Gabi?",
      "answers": [
        {
          "text": "Jacket",
          "points": 28,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Barya / Pera",
          "points": 21,
          "aliases": [
            "barya / pera",
            "coins",
            "money"
          ]
        },
        {
          "text": "Rosary / Dasalan",
          "points": 17,
          "aliases": [
            "rosary",
            "rosary / dasalan"
          ]
        },
        {
          "text": "Cellphone",
          "points": 14,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 11,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        },
        {
          "text": "Pagkain / Baon",
          "points": 9,
          "aliases": [
            "food",
            "pagkain / baon",
            "snack"
          ]
        }
      ]
    },
    {
      "id": "sleepover-1",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag may sleepover.",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-2",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang karaniwang nasa bag kapag may sleepover?",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-3",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag may sleepover?",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang importanteng bitbit kapag may sleepover?",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang hinahanap bago umalis kapag may sleepover?",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-6",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng gamit na laging kasama kapag may sleepover.",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na dala ng tao kapag may sleepover?",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag may sleepover?",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas kailanganin kapag may sleepover?",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "sleepover-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag may sleepover?",
      "answers": [
        {
          "text": "Pajama / Damit",
          "points": 32,
          "aliases": [
            "clothes",
            "pajama",
            "pajama / damit"
          ]
        },
        {
          "text": "Toothbrush",
          "points": 20,
          "aliases": [
            "brush",
            "toothbrush"
          ]
        },
        {
          "text": "Pillow / Unan",
          "points": 16,
          "aliases": [
            "pillow",
            "pillow / unan",
            "unan"
          ]
        },
        {
          "text": "Cellphone charger",
          "points": 12,
          "aliases": [
            "cellphone charger",
            "charger"
          ]
        },
        {
          "text": "Face towel",
          "points": 11,
          "aliases": [
            "face towel",
            "towel"
          ]
        },
        {
          "text": "Snacks",
          "points": 9,
          "aliases": [
            "food",
            "snacks"
          ]
        }
      ]
    },
    {
      "id": "picnic-1",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag may picnic.",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-2",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang karaniwang nasa bag kapag may picnic?",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-3",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag may picnic?",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang importanteng bitbit kapag may picnic?",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang hinahanap bago umalis kapag may picnic?",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-6",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng gamit na laging kasama kapag may picnic.",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na dala ng tao kapag may picnic?",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag may picnic?",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas kailanganin kapag may picnic?",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "picnic-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag may picnic?",
      "answers": [
        {
          "text": "Pagkain",
          "points": 27,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Banig / Mat",
          "points": 22,
          "aliases": [
            "banig",
            "banig / mat",
            "mat"
          ]
        },
        {
          "text": "Tubig / Inumin",
          "points": 18,
          "aliases": [
            "drinks",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Plates / Kubyertos",
          "points": 13,
          "aliases": [
            "plates / kubyertos",
            "spoon and fork",
            "utensils"
          ]
        },
        {
          "text": "Cellphone / Speaker",
          "points": 11,
          "aliases": [
            "cellphone / speaker",
            "phone",
            "speaker"
          ]
        },
        {
          "text": "Trash bag",
          "points": 9,
          "aliases": [
            "garbage bag",
            "trash bag"
          ]
        }
      ]
    },
    {
      "id": "job-interview-1",
      "category": "WORK & MONEY",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag pupunta sa job interview.",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-2",
      "category": "WORK & MONEY",
      "prompt": "Ano ang karaniwang nasa bag kapag pupunta sa job interview?",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-3",
      "category": "WORK & MONEY",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag pupunta sa job interview?",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-4",
      "category": "WORK & MONEY",
      "prompt": "Ano ang importanteng bitbit kapag pupunta sa job interview?",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-5",
      "category": "WORK & MONEY",
      "prompt": "Ano ang unang hinahanap bago umalis kapag pupunta sa job interview?",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-6",
      "category": "WORK & MONEY",
      "prompt": "Magbanggit ng gamit na laging kasama kapag pupunta sa job interview.",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-7",
      "category": "WORK & MONEY",
      "prompt": "Ano ang common na dala ng tao kapag pupunta sa job interview?",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-8",
      "category": "WORK & MONEY",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag pupunta sa job interview?",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-9",
      "category": "WORK & MONEY",
      "prompt": "Ano ang madalas kailanganin kapag pupunta sa job interview?",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "job-interview-10",
      "category": "WORK & MONEY",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag pupunta sa job interview?",
      "answers": [
        {
          "text": "Resume",
          "points": 29,
          "aliases": [
            "bio data",
            "cv",
            "resume"
          ]
        },
        {
          "text": "Valid ID",
          "points": 21,
          "aliases": [
            "id",
            "valid id"
          ]
        },
        {
          "text": "Ballpen",
          "points": 16,
          "aliases": [
            "ballpen",
            "pen"
          ]
        },
        {
          "text": "Folder / Envelope",
          "points": 13,
          "aliases": [
            "envelope",
            "folder",
            "folder / envelope"
          ]
        },
        {
          "text": "Cellphone",
          "points": 12,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Panyo",
          "points": 9,
          "aliases": [
            "handkerchief",
            "panyo"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-1",
      "category": "SPORTS & FUN",
      "prompt": "Magbanggit ng bagay na madalas dalhin ng tao kapag magwo-workout sa gym.",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-2",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang karaniwang nasa bag kapag magwo-workout sa gym?",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-3",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang ayaw makalimutan ng tao kapag magwo-workout sa gym?",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-4",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang importanteng bitbit kapag magwo-workout sa gym?",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-5",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang unang hinahanap bago umalis kapag magwo-workout sa gym?",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-6",
      "category": "SPORTS & FUN",
      "prompt": "Magbanggit ng gamit na laging kasama kapag magwo-workout sa gym.",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-7",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang common na dala ng tao kapag magwo-workout sa gym?",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-8",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang kadalasang inilalagay sa bag kapag magwo-workout sa gym?",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-9",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang madalas kailanganin kapag magwo-workout sa gym?",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "gym-workout-10",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang karaniwang bitbit ng isang tao kapag magwo-workout sa gym?",
      "answers": [
        {
          "text": "Tubig",
          "points": 26,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 22,
          "aliases": [
            "towel",
            "tuwalya"
          ]
        },
        {
          "text": "Workout clothes",
          "points": 18,
          "aliases": [
            "gym clothes",
            "sportswear",
            "workout clothes"
          ]
        },
        {
          "text": "Sapatos",
          "points": 14,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Earphones",
          "points": 12,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Shaker / Protein drink",
          "points": 8,
          "aliases": [
            "protein",
            "shaker",
            "shaker / protein drink"
          ]
        }
      ]
    },
    {
      "id": "brownout-1",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas gawin ng tao kapag brownout sa bahay?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-2",
      "category": "FAMILY & HOME",
      "prompt": "Kapag brownout sa bahay, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-3",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag brownout sa bahay.",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag brownout sa bahay?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na ginagawa kapag brownout sa bahay?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-6",
      "category": "FAMILY & HOME",
      "prompt": "Kapag brownout sa bahay, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag brownout sa bahay?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang ginagawa ng marami kapag brownout sa bahay?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag brownout sa bahay?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "brownout-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag brownout sa bahay?",
      "answers": [
        {
          "text": "Matulog",
          "points": 30,
          "aliases": [
            "matulog",
            "sleep",
            "tulog"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 22,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 17,
          "aliases": [
            "chika",
            "kwentuhan",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Lumabas ng bahay",
          "points": 13,
          "aliases": [
            "labas",
            "lumabas ng bahay"
          ]
        },
        {
          "text": "Magpaypay",
          "points": 10,
          "aliases": [
            "fan self",
            "magpaypay",
            "paypay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 8,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-1",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas gawin ng tao kapag bored sa bahay?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-2",
      "category": "FAMILY & HOME",
      "prompt": "Kapag bored sa bahay, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-3",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag bored sa bahay.",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag bored sa bahay?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na ginagawa kapag bored sa bahay?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-6",
      "category": "FAMILY & HOME",
      "prompt": "Kapag bored sa bahay, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag bored sa bahay?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang ginagawa ng marami kapag bored sa bahay?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag bored sa bahay?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "bored-sa-bahay-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag bored sa bahay?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 28,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Matulog",
          "points": 21,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Manood ng TV / videos",
          "points": 17,
          "aliases": [
            "manood ng tv / videos",
            "netflix",
            "watch tv",
            "youtube"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Maglinis",
          "points": 11,
          "aliases": [
            "clean",
            "linis",
            "maglinis"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-1",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang madalas gawin ng tao kapag maulan buong araw?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-2",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Kapag maulan buong araw, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-3",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag maulan buong araw.",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-4",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag maulan buong araw?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-5",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang common na ginagawa kapag maulan buong araw?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-6",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Kapag maulan buong araw, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-7",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag maulan buong araw?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-8",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang ginagawa ng marami kapag maulan buong araw?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-9",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag maulan buong araw?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "maulang-araw-10",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag maulan buong araw?",
      "answers": [
        {
          "text": "Matulog",
          "points": 32,
          "aliases": [
            "matulog",
            "sleep"
          ]
        },
        {
          "text": "Magkape / Magtsaa",
          "points": 20,
          "aliases": [
            "coffee",
            "magkape / magtsaa",
            "tea"
          ]
        },
        {
          "text": "Manood ng movie / series",
          "points": 16,
          "aliases": [
            "manood ng movie / series",
            "movie",
            "netflix",
            "series"
          ]
        },
        {
          "text": "Kumain ng mainit na pagkain",
          "points": 12,
          "aliases": [
            "kumain ng mainit na pagkain",
            "noodles",
            "soup"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 11,
          "aliases": [
            "cellphone",
            "mag-cellphone",
            "phone"
          ]
        },
        {
          "text": "Maglinis / ayos ng bahay",
          "points": 9,
          "aliases": [
            "cleaning",
            "linis",
            "maglinis / ayos ng bahay"
          ]
        }
      ]
    },
    {
      "id": "after-class-1",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas gawin ng tao pagkatapos ng klase?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-2",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag pagkatapos ng klase, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-3",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao pagkatapos ng klase.",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang unang ginagawa ng karamihan pagkatapos ng klase?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-5",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na ginagawa pagkatapos ng klase?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-6",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag pagkatapos ng klase, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang kadalasang trip gawin ng tao pagkatapos ng klase?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang ginagawa ng marami pagkatapos ng klase?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-9",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao pagkatapos ng klase?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "after-class-10",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao pagkatapos ng klase?",
      "answers": [
        {
          "text": "Umuwi",
          "points": 27,
          "aliases": [
            "go home",
            "umuwi",
            "uwi"
          ]
        },
        {
          "text": "Kumain",
          "points": 22,
          "aliases": [
            "eat",
            "kumain",
            "snack"
          ]
        },
        {
          "text": "Makipagkita sa kaibigan",
          "points": 18,
          "aliases": [
            "barkada",
            "friends",
            "makipagkita sa kaibigan",
            "tambay"
          ]
        },
        {
          "text": "Gumawa ng assignment",
          "points": 13,
          "aliases": [
            "assignment",
            "gumawa ng assignment",
            "homework"
          ]
        },
        {
          "text": "Maglaro",
          "points": 11,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Matulog",
          "points": 9,
          "aliases": [
            "matulog",
            "sleep"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-1",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas gawin ng tao kapag may family reunion?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-2",
      "category": "FAMILY & HOME",
      "prompt": "Kapag may family reunion, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-3",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag may family reunion.",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag may family reunion?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na ginagawa kapag may family reunion?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-6",
      "category": "FAMILY & HOME",
      "prompt": "Kapag may family reunion, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag may family reunion?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang ginagawa ng marami kapag may family reunion?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag may family reunion?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "family-reunion-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag may family reunion?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 21,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 16,
          "aliases": [
            "mag-picture",
            "picture",
            "take pictures"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 13,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Maglaro",
          "points": 12,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        },
        {
          "text": "Magmano / bumati sa kamag-anak",
          "points": 9,
          "aliases": [
            "greet relatives",
            "magmano / bumati sa kamag-anak",
            "mano"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-1",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas gawin ng tao kapag nasa mall kasama ang friends?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-2",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Kapag nasa mall kasama ang friends, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-3",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag nasa mall kasama ang friends.",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-4",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag nasa mall kasama ang friends?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-5",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang common na ginagawa kapag nasa mall kasama ang friends?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-6",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Kapag nasa mall kasama ang friends, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-7",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag nasa mall kasama ang friends?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-8",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang ginagawa ng marami kapag nasa mall kasama ang friends?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-9",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag nasa mall kasama ang friends?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "mall-with-friends-10",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag nasa mall kasama ang friends?",
      "answers": [
        {
          "text": "Kumain",
          "points": 26,
          "aliases": [
            "eat",
            "food",
            "kumain"
          ]
        },
        {
          "text": "Mag-window shop",
          "points": 22,
          "aliases": [
            "ikot",
            "mag-window shop",
            "window shopping"
          ]
        },
        {
          "text": "Manood ng sine",
          "points": 18,
          "aliases": [
            "cinema",
            "manood ng sine",
            "movie"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 14,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        },
        {
          "text": "Maglaro sa arcade",
          "points": 12,
          "aliases": [
            "arcade",
            "games",
            "maglaro sa arcade"
          ]
        },
        {
          "text": "Magkape / milk tea",
          "points": 8,
          "aliases": [
            "coffee",
            "magkape / milk tea",
            "milk tea"
          ]
        }
      ]
    },
    {
      "id": "commuting-1",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang madalas gawin ng tao habang nagko-commute?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-2",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Kapag habang nagko-commute, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-3",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao habang nagko-commute.",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-4",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang unang ginagawa ng karamihan habang nagko-commute?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-5",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang common na ginagawa habang nagko-commute?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-6",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Kapag habang nagko-commute, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-7",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang kadalasang trip gawin ng tao habang nagko-commute?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-8",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang ginagawa ng marami habang nagko-commute?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-9",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao habang nagko-commute?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "commuting-10",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao habang nagko-commute?",
      "answers": [
        {
          "text": "Mag-cellphone",
          "points": 30,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Makinig ng music",
          "points": 22,
          "aliases": [
            "makinig ng music",
            "music",
            "songs"
          ]
        },
        {
          "text": "Matulog",
          "points": 17,
          "aliases": [
            "matulog",
            "nap",
            "sleep"
          ]
        },
        {
          "text": "Tumingin sa daan",
          "points": 13,
          "aliases": [
            "look outside",
            "tumingin sa daan"
          ]
        },
        {
          "text": "Makipag-chat",
          "points": 10,
          "aliases": [
            "chat",
            "makipag-chat",
            "text"
          ]
        },
        {
          "text": "Mag-abang ng babaan",
          "points": 8,
          "aliases": [
            "babaan",
            "mag-abang ng babaan",
            "watch stop"
          ]
        }
      ]
    },
    {
      "id": "stressed-1",
      "category": "TEEN LIFE",
      "prompt": "Ano ang madalas gawin ng tao kapag stressed sa school?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-2",
      "category": "TEEN LIFE",
      "prompt": "Kapag stressed sa school, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-3",
      "category": "TEEN LIFE",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag stressed sa school.",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-4",
      "category": "TEEN LIFE",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag stressed sa school?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-5",
      "category": "TEEN LIFE",
      "prompt": "Ano ang common na ginagawa kapag stressed sa school?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-6",
      "category": "TEEN LIFE",
      "prompt": "Kapag stressed sa school, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-7",
      "category": "TEEN LIFE",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag stressed sa school?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-8",
      "category": "TEEN LIFE",
      "prompt": "Ano ang ginagawa ng marami kapag stressed sa school?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-9",
      "category": "TEEN LIFE",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag stressed sa school?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "stressed-10",
      "category": "TEEN LIFE",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag stressed sa school?",
      "answers": [
        {
          "text": "Matulog / Magpahinga",
          "points": 28,
          "aliases": [
            "matulog / magpahinga",
            "pahinga",
            "rest",
            "sleep"
          ]
        },
        {
          "text": "Makinig sa music",
          "points": 21,
          "aliases": [
            "makinig sa music",
            "music"
          ]
        },
        {
          "text": "Mag-cellphone",
          "points": 17,
          "aliases": [
            "mag-cellphone",
            "phone",
            "scroll"
          ]
        },
        {
          "text": "Kumain",
          "points": 14,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Makipag-usap sa kaibigan",
          "points": 11,
          "aliases": [
            "friend",
            "makipag-usap sa kaibigan",
            "talk to friend",
            "usap"
          ]
        },
        {
          "text": "Maglaro",
          "points": 9,
          "aliases": [
            "games",
            "laro",
            "maglaro"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-1",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang madalas gawin ng tao kapag mabagal ang internet?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-2",
      "category": "TECH & GADGETS",
      "prompt": "Kapag mabagal ang internet, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-3",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag mabagal ang internet.",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-4",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag mabagal ang internet?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-5",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang common na ginagawa kapag mabagal ang internet?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-6",
      "category": "TECH & GADGETS",
      "prompt": "Kapag mabagal ang internet, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-7",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag mabagal ang internet?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-8",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang ginagawa ng marami kapag mabagal ang internet?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-9",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag mabagal ang internet?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-10",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag mabagal ang internet?",
      "answers": [
        {
          "text": "Maghintay",
          "points": 32,
          "aliases": [
            "maghintay",
            "wait"
          ]
        },
        {
          "text": "I-restart ang Wi-Fi",
          "points": 20,
          "aliases": [
            "i-restart ang wi-fi",
            "restart router",
            "restart wifi"
          ]
        },
        {
          "text": "Mag-mobile data",
          "points": 16,
          "aliases": [
            "data",
            "mag-mobile data",
            "mobile data"
          ]
        },
        {
          "text": "Magreklamo",
          "points": 12,
          "aliases": [
            "complain",
            "magreklamo",
            "rant"
          ]
        },
        {
          "text": "Lumapit sa router",
          "points": 11,
          "aliases": [
            "go near router",
            "lumapit sa router",
            "router"
          ]
        },
        {
          "text": "Tumigil muna",
          "points": 9,
          "aliases": [
            "pause",
            "stop using",
            "tumigil muna"
          ]
        }
      ]
    },
    {
      "id": "weekend-1",
      "category": "WEEKEND FUN",
      "prompt": "Ano ang madalas gawin ng tao kapag weekend?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-2",
      "category": "WEEKEND FUN",
      "prompt": "Kapag weekend, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-3",
      "category": "WEEKEND FUN",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag weekend.",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-4",
      "category": "WEEKEND FUN",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag weekend?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-5",
      "category": "WEEKEND FUN",
      "prompt": "Ano ang common na ginagawa kapag weekend?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-6",
      "category": "WEEKEND FUN",
      "prompt": "Kapag weekend, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-7",
      "category": "WEEKEND FUN",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag weekend?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-8",
      "category": "WEEKEND FUN",
      "prompt": "Ano ang ginagawa ng marami kapag weekend?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-9",
      "category": "WEEKEND FUN",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag weekend?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "weekend-10",
      "category": "WEEKEND FUN",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag weekend?",
      "answers": [
        {
          "text": "Matulog nang mahaba",
          "points": 27,
          "aliases": [
            "matulog nang mahaba",
            "rest",
            "sleep late"
          ]
        },
        {
          "text": "Lumabas kasama friends/family",
          "points": 22,
          "aliases": [
            "gala",
            "labas",
            "lumabas kasama friends/family"
          ]
        },
        {
          "text": "Maglinis ng bahay",
          "points": 18,
          "aliases": [
            "clean house",
            "linis",
            "maglinis ng bahay"
          ]
        },
        {
          "text": "Maglaro",
          "points": 13,
          "aliases": [
            "games",
            "maglaro",
            "sports"
          ]
        },
        {
          "text": "Manood",
          "points": 11,
          "aliases": [
            "manood",
            "movie",
            "watch tv"
          ]
        },
        {
          "text": "Maglaba / chores",
          "points": 9,
          "aliases": [
            "chores",
            "laba",
            "maglaba / chores"
          ]
        }
      ]
    },
    {
      "id": "fiesta-1",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang madalas gawin ng tao kapag may fiesta sa barangay?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-2",
      "category": "PINOY CULTURE",
      "prompt": "Kapag may fiesta sa barangay, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-3",
      "category": "PINOY CULTURE",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag may fiesta sa barangay.",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-4",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag may fiesta sa barangay?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-5",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang common na ginagawa kapag may fiesta sa barangay?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-6",
      "category": "PINOY CULTURE",
      "prompt": "Kapag may fiesta sa barangay, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-7",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag may fiesta sa barangay?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-8",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang ginagawa ng marami kapag may fiesta sa barangay?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-9",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag may fiesta sa barangay?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "fiesta-10",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag may fiesta sa barangay?",
      "answers": [
        {
          "text": "Kumain",
          "points": 29,
          "aliases": [
            "eat",
            "kumain"
          ]
        },
        {
          "text": "Mag-videoke",
          "points": 21,
          "aliases": [
            "karaoke",
            "mag-videoke",
            "videoke"
          ]
        },
        {
          "text": "Manood ng programa",
          "points": 16,
          "aliases": [
            "manood ng programa",
            "show",
            "watch program"
          ]
        },
        {
          "text": "Makipagkwentuhan",
          "points": 13,
          "aliases": [
            "chika",
            "makipagkwentuhan",
            "usap"
          ]
        },
        {
          "text": "Sumali sa palaro",
          "points": 12,
          "aliases": [
            "contest",
            "games",
            "sumali sa palaro"
          ]
        },
        {
          "text": "Mag-picture",
          "points": 9,
          "aliases": [
            "mag-picture",
            "picture",
            "selfie"
          ]
        }
      ]
    },
    {
      "id": "viral-post-1",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang madalas gawin ng tao kapag may nakitang viral post?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-2",
      "category": "SOCIAL MEDIA",
      "prompt": "Kapag may nakitang viral post, ano ang karaniwang ginagawa?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-3",
      "category": "SOCIAL MEDIA",
      "prompt": "Magbanggit ng bagay na madalas ginagawa ng tao kapag may nakitang viral post.",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-4",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang unang ginagawa ng karamihan kapag may nakitang viral post?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-5",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang common na ginagawa kapag may nakitang viral post?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-6",
      "category": "SOCIAL MEDIA",
      "prompt": "Kapag may nakitang viral post, saan madalas mapunta ang oras ng tao?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-7",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang kadalasang trip gawin ng tao kapag may nakitang viral post?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-8",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang ginagawa ng marami kapag may nakitang viral post?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-9",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang puwedeng asahan na gagawin ng tao kapag may nakitang viral post?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "viral-post-10",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang madalas pinagkakaabalahan ng tao kapag may nakitang viral post?",
      "answers": [
        {
          "text": "Mag-react / like",
          "points": 26,
          "aliases": [
            "like",
            "mag-react / like",
            "react"
          ]
        },
        {
          "text": "Mag-share",
          "points": 22,
          "aliases": [
            "mag-share",
            "share"
          ]
        },
        {
          "text": "Mag-comment",
          "points": 18,
          "aliases": [
            "comment",
            "mag-comment"
          ]
        },
        {
          "text": "I-send sa kaibigan",
          "points": 14,
          "aliases": [
            "i-send sa kaibigan",
            "send to friend",
            "share to friend"
          ]
        },
        {
          "text": "Basahin ang caption",
          "points": 12,
          "aliases": [
            "basahin ang caption",
            "read caption"
          ]
        },
        {
          "text": "I-screenshot",
          "points": 8,
          "aliases": [
            "i-screenshot",
            "screenshot"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-1",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas bilhin ng tao sa sari-sari store?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-2",
      "category": "SHOPPING & MONEY",
      "prompt": "Kapag namimili sa sari-sari store, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-3",
      "category": "SHOPPING & MONEY",
      "prompt": "Magbanggit ng produktong madalas binibili sa sari-sari store.",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-4",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang common na item na binibili sa sari-sari store?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-5",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang unang hinahanap ng tao sa sari-sari store?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-6",
      "category": "SHOPPING & MONEY",
      "prompt": "Kung pupunta ang tao sa sari-sari store, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-7",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang karaniwang laman ng resibo sa sari-sari store?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-8",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang paboritong bilhin ng marami sa sari-sari store?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-9",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas isama sa budget sa sari-sari store?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "sari-sari-store-10",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas inuuwi galing sa sari-sari store?",
      "answers": [
        {
          "text": "Softdrinks / Juice",
          "points": 30,
          "aliases": [
            "juice",
            "soda",
            "softdrinks",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Chichirya",
          "points": 22,
          "aliases": [
            "chichirya",
            "chips",
            "junk food"
          ]
        },
        {
          "text": "Candy",
          "points": 17,
          "aliases": [
            "candy",
            "sweets"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "noodles",
            "pancit canton"
          ]
        },
        {
          "text": "Load",
          "points": 10,
          "aliases": [
            "load",
            "mobile load"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "palengke-1",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas bilhin ng tao sa palengke?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-2",
      "category": "SHOPPING & MONEY",
      "prompt": "Kapag namimili sa palengke, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-3",
      "category": "SHOPPING & MONEY",
      "prompt": "Magbanggit ng produktong madalas binibili sa palengke.",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-4",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang common na item na binibili sa palengke?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-5",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang unang hinahanap ng tao sa palengke?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-6",
      "category": "SHOPPING & MONEY",
      "prompt": "Kung pupunta ang tao sa palengke, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-7",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang karaniwang laman ng resibo sa palengke?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-8",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang paboritong bilhin ng marami sa palengke?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-9",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas isama sa budget sa palengke?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "palengke-10",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas inuuwi galing sa palengke?",
      "answers": [
        {
          "text": "Gulay",
          "points": 28,
          "aliases": [
            "gulay",
            "vegetables",
            "veggies"
          ]
        },
        {
          "text": "Isda",
          "points": 21,
          "aliases": [
            "fish",
            "isda"
          ]
        },
        {
          "text": "Karne",
          "points": 17,
          "aliases": [
            "karne",
            "meat"
          ]
        },
        {
          "text": "Prutas",
          "points": 14,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Itlog",
          "points": 11,
          "aliases": [
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Bigas",
          "points": 9,
          "aliases": [
            "bigas",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-1",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas bilhin ng tao sa convenience store?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-2",
      "category": "SHOPPING & MONEY",
      "prompt": "Kapag namimili sa convenience store, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-3",
      "category": "SHOPPING & MONEY",
      "prompt": "Magbanggit ng produktong madalas binibili sa convenience store.",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-4",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang common na item na binibili sa convenience store?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-5",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang unang hinahanap ng tao sa convenience store?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-6",
      "category": "SHOPPING & MONEY",
      "prompt": "Kung pupunta ang tao sa convenience store, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-7",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang karaniwang laman ng resibo sa convenience store?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-8",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang paboritong bilhin ng marami sa convenience store?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-9",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas isama sa budget sa convenience store?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "convenience-store-10",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas inuuwi galing sa convenience store?",
      "answers": [
        {
          "text": "Tubig / Inumin",
          "points": 32,
          "aliases": [
            "drink",
            "tubig / inumin",
            "water"
          ]
        },
        {
          "text": "Snacks",
          "points": 20,
          "aliases": [
            "chips",
            "junk food",
            "snacks"
          ]
        },
        {
          "text": "Cup noodles",
          "points": 16,
          "aliases": [
            "cup noodles",
            "instant noodles",
            "noodles"
          ]
        },
        {
          "text": "Tinapay / sandwich",
          "points": 12,
          "aliases": [
            "bread",
            "sandwich",
            "tinapay / sandwich"
          ]
        },
        {
          "text": "Ice cream",
          "points": 11,
          "aliases": [
            "ice cream",
            "sorbetes"
          ]
        },
        {
          "text": "Load / e-wallet cash in",
          "points": 9,
          "aliases": [
            "cash in",
            "load",
            "load / e-wallet cash in"
          ]
        }
      ]
    },
    {
      "id": "canteen-1",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas bilhin ng tao sa school canteen?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-2",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag namimili sa school canteen, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-3",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng produktong madalas binibili sa school canteen.",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na item na binibili sa school canteen?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-5",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang unang hinahanap ng tao sa school canteen?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-6",
      "category": "SCHOOL LIFE",
      "prompt": "Kung pupunta ang tao sa school canteen, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang karaniwang laman ng resibo sa school canteen?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang paboritong bilhin ng marami sa school canteen?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-9",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas isama sa budget sa school canteen?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "canteen-10",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas inuuwi galing sa school canteen?",
      "answers": [
        {
          "text": "Juice / Softdrinks",
          "points": 27,
          "aliases": [
            "juice",
            "juice / softdrinks",
            "softdrinks"
          ]
        },
        {
          "text": "Tinapay",
          "points": 22,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Rice meal",
          "points": 18,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Chips",
          "points": 13,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Candy / Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "candy / chocolate",
            "chocolate"
          ]
        },
        {
          "text": "Noodles",
          "points": 9,
          "aliases": [
            "noodles",
            "pancit canton"
          ]
        }
      ]
    },
    {
      "id": "bakery-1",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas bilhin ng tao sa bakery?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-2",
      "category": "FOOD & DRINK",
      "prompt": "Kapag namimili sa bakery, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-3",
      "category": "FOOD & DRINK",
      "prompt": "Magbanggit ng produktong madalas binibili sa bakery.",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-4",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang common na item na binibili sa bakery?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-5",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang unang hinahanap ng tao sa bakery?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-6",
      "category": "FOOD & DRINK",
      "prompt": "Kung pupunta ang tao sa bakery, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-7",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang karaniwang laman ng resibo sa bakery?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-8",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang paboritong bilhin ng marami sa bakery?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-9",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas isama sa budget sa bakery?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "bakery-10",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas inuuwi galing sa bakery?",
      "answers": [
        {
          "text": "Pandesal",
          "points": 29,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Ensaymada",
          "points": 21,
          "aliases": [
            "bread",
            "ensaymada"
          ]
        },
        {
          "text": "Spanish bread",
          "points": 16,
          "aliases": [
            "bread",
            "spanish bread"
          ]
        },
        {
          "text": "Monay",
          "points": 13,
          "aliases": [
            "bread",
            "monay"
          ]
        },
        {
          "text": "Loaf bread",
          "points": 12,
          "aliases": [
            "loaf",
            "loaf bread"
          ]
        },
        {
          "text": "Cake slice",
          "points": 9,
          "aliases": [
            "cake",
            "cake slice"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-1",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas bilhin ng tao sa ukay-ukay?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-2",
      "category": "SHOPPING & MONEY",
      "prompt": "Kapag namimili sa ukay-ukay, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-3",
      "category": "SHOPPING & MONEY",
      "prompt": "Magbanggit ng produktong madalas binibili sa ukay-ukay.",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-4",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang common na item na binibili sa ukay-ukay?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-5",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang unang hinahanap ng tao sa ukay-ukay?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-6",
      "category": "SHOPPING & MONEY",
      "prompt": "Kung pupunta ang tao sa ukay-ukay, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-7",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang karaniwang laman ng resibo sa ukay-ukay?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-8",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang paboritong bilhin ng marami sa ukay-ukay?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-9",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas isama sa budget sa ukay-ukay?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "ukay-ukay-10",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas inuuwi galing sa ukay-ukay?",
      "answers": [
        {
          "text": "T-shirt",
          "points": 26,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Pants / Jeans",
          "points": 22,
          "aliases": [
            "jeans",
            "pants",
            "pants / jeans"
          ]
        },
        {
          "text": "Jacket",
          "points": 18,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        },
        {
          "text": "Dress",
          "points": 14,
          "aliases": [
            "dress"
          ]
        },
        {
          "text": "Bag",
          "points": 12,
          "aliases": [
            "bag",
            "handbag"
          ]
        },
        {
          "text": "Sapatos",
          "points": 8,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "online-sale-1",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas bilhin ng tao kapag may online sale?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-2",
      "category": "SHOPPING & MONEY",
      "prompt": "Kapag namimili kapag may online sale, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-3",
      "category": "SHOPPING & MONEY",
      "prompt": "Magbanggit ng produktong madalas binibili kapag may online sale.",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-4",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang common na item na binibili kapag may online sale?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-5",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang unang hinahanap ng tao kapag may online sale?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-6",
      "category": "SHOPPING & MONEY",
      "prompt": "Kung pupunta ang tao kapag may online sale, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-7",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang karaniwang laman ng resibo kapag may online sale?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-8",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang paboritong bilhin ng marami kapag may online sale?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-9",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas isama sa budget kapag may online sale?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "online-sale-10",
      "category": "SHOPPING & MONEY",
      "prompt": "Ano ang madalas inuuwi galing kapag may online sale?",
      "answers": [
        {
          "text": "Damit",
          "points": 30,
          "aliases": [
            "clothes",
            "damit"
          ]
        },
        {
          "text": "Gadgets / accessories",
          "points": 22,
          "aliases": [
            "gadget",
            "gadgets / accessories",
            "phone case"
          ]
        },
        {
          "text": "Beauty products",
          "points": 17,
          "aliases": [
            "beauty products",
            "makeup",
            "skincare"
          ]
        },
        {
          "text": "Shoes",
          "points": 13,
          "aliases": [
            "sapatos",
            "shoes"
          ]
        },
        {
          "text": "Household items",
          "points": 10,
          "aliases": [
            "home items",
            "household items",
            "organizer"
          ]
        },
        {
          "text": "Snacks / food",
          "points": 8,
          "aliases": [
            "food",
            "snacks",
            "snacks / food"
          ]
        }
      ]
    },
    {
      "id": "hardware-1",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas bilhin ng tao sa hardware?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-2",
      "category": "FAMILY & HOME",
      "prompt": "Kapag namimili sa hardware, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-3",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng produktong madalas binibili sa hardware.",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na item na binibili sa hardware?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang hinahanap ng tao sa hardware?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-6",
      "category": "FAMILY & HOME",
      "prompt": "Kung pupunta ang tao sa hardware, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang karaniwang laman ng resibo sa hardware?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang paboritong bilhin ng marami sa hardware?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas isama sa budget sa hardware?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "hardware-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas inuuwi galing sa hardware?",
      "answers": [
        {
          "text": "Pako",
          "points": 28,
          "aliases": [
            "nails",
            "pako"
          ]
        },
        {
          "text": "Martilyo",
          "points": 21,
          "aliases": [
            "hammer",
            "martilyo"
          ]
        },
        {
          "text": "Pintura",
          "points": 17,
          "aliases": [
            "paint",
            "pintura"
          ]
        },
        {
          "text": "Screw / turnilyo",
          "points": 14,
          "aliases": [
            "screw",
            "screw / turnilyo",
            "turnilyo"
          ]
        },
        {
          "text": "Wrench / tools",
          "points": 11,
          "aliases": [
            "tool",
            "wrench",
            "wrench / tools"
          ]
        },
        {
          "text": "Tape / electrical tape",
          "points": 9,
          "aliases": [
            "tape",
            "tape / electrical tape"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-1",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang madalas bilhin ng tao sa botika / pharmacy?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-2",
      "category": "HEALTH & WELLNESS",
      "prompt": "Kapag namimili sa botika / pharmacy, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-3",
      "category": "HEALTH & WELLNESS",
      "prompt": "Magbanggit ng produktong madalas binibili sa botika / pharmacy.",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-4",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang common na item na binibili sa botika / pharmacy?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-5",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang unang hinahanap ng tao sa botika / pharmacy?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-6",
      "category": "HEALTH & WELLNESS",
      "prompt": "Kung pupunta ang tao sa botika / pharmacy, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-7",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang karaniwang laman ng resibo sa botika / pharmacy?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-8",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang paboritong bilhin ng marami sa botika / pharmacy?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-9",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang madalas isama sa budget sa botika / pharmacy?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pharmacy-10",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang madalas inuuwi galing sa botika / pharmacy?",
      "answers": [
        {
          "text": "Biogesic / paracetamol",
          "points": 32,
          "aliases": [
            "biogesic",
            "biogesic / paracetamol",
            "paracetamol"
          ]
        },
        {
          "text": "Vitamins",
          "points": 20,
          "aliases": [
            "multivitamins",
            "vitamins"
          ]
        },
        {
          "text": "Cough syrup",
          "points": 16,
          "aliases": [
            "cough syrup",
            "syrup",
            "ubo syrup"
          ]
        },
        {
          "text": "Band-aid",
          "points": 12,
          "aliases": [
            "band-aid",
            "bandaid"
          ]
        },
        {
          "text": "Alcohol",
          "points": 11,
          "aliases": [
            "alcohol",
            "sanitizer"
          ]
        },
        {
          "text": "Face mask",
          "points": 9,
          "aliases": [
            "face mask",
            "mask"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-1",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas bilhin ng tao sa pet shop?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-2",
      "category": "FAMILY & HOME",
      "prompt": "Kapag namimili sa pet shop, ano ang karaniwang binibili?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-3",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng produktong madalas binibili sa pet shop.",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na item na binibili sa pet shop?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang hinahanap ng tao sa pet shop?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-6",
      "category": "FAMILY & HOME",
      "prompt": "Kung pupunta ang tao sa pet shop, ano ang uuwi sa kanya?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang karaniwang laman ng resibo sa pet shop?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang paboritong bilhin ng marami sa pet shop?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas isama sa budget sa pet shop?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "pet-shop-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas inuuwi galing sa pet shop?",
      "answers": [
        {
          "text": "Dog food",
          "points": 27,
          "aliases": [
            "dog food",
            "pet food"
          ]
        },
        {
          "text": "Cat food",
          "points": 22,
          "aliases": [
            "cat food",
            "pet food"
          ]
        },
        {
          "text": "Pet treats",
          "points": 18,
          "aliases": [
            "pet treats",
            "treats"
          ]
        },
        {
          "text": "Shampoo",
          "points": 13,
          "aliases": [
            "pet shampoo",
            "shampoo"
          ]
        },
        {
          "text": "Leash / collar",
          "points": 11,
          "aliases": [
            "collar",
            "leash",
            "leash / collar"
          ]
        },
        {
          "text": "Toy para sa pet",
          "points": 9,
          "aliases": [
            "pet toy",
            "toy",
            "toy para sa pet"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-1",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas makita sa birthday party?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-2",
      "category": "CELEBRATIONS",
      "prompt": "Kapag nasa birthday party, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-3",
      "category": "CELEBRATIONS",
      "prompt": "Magbanggit ng bagay na normal makita sa birthday party.",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-4",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang unang napapansin ng tao sa birthday party?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-5",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang laging present sa birthday party?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-6",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang asahan mong makikita sa birthday party?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-7",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang common na tanawin sa birthday party?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-8",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas laman o present sa birthday party?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-9",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang halos hindi nawawala sa birthday party?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "birthday-party-10",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang palaging nandiyan sa birthday party?",
      "answers": [
        {
          "text": "Cake",
          "points": 29,
          "aliases": [
            "birthday cake",
            "cake"
          ]
        },
        {
          "text": "Lobo",
          "points": 21,
          "aliases": [
            "balloons",
            "lobo"
          ]
        },
        {
          "text": "Pagkain",
          "points": 16,
          "aliases": [
            "food",
            "pagkain"
          ]
        },
        {
          "text": "Regalo",
          "points": 13,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Mga bisita",
          "points": 12,
          "aliases": [
            "guests",
            "mga bisita",
            "visitors"
          ]
        },
        {
          "text": "Kandila",
          "points": 9,
          "aliases": [
            "candles",
            "kandila"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-1",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang madalas makita kapag may barangay fiesta?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-2",
      "category": "PINOY CULTURE",
      "prompt": "Kapag nasa may barangay fiesta, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-3",
      "category": "PINOY CULTURE",
      "prompt": "Magbanggit ng bagay na normal makita kapag may barangay fiesta.",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-4",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang unang napapansin ng tao kapag may barangay fiesta?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-5",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang laging present kapag may barangay fiesta?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-6",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang asahan mong makikita kapag may barangay fiesta?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-7",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang common na tanawin kapag may barangay fiesta?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-8",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang madalas laman o present kapag may barangay fiesta?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-9",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang halos hindi nawawala kapag may barangay fiesta?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "barangay-fiesta-10",
      "category": "PINOY CULTURE",
      "prompt": "Ano ang palaging nandiyan kapag may barangay fiesta?",
      "answers": [
        {
          "text": "Maraming handa",
          "points": 26,
          "aliases": [
            "food",
            "handa",
            "maraming handa"
          ]
        },
        {
          "text": "Videoke",
          "points": 22,
          "aliases": [
            "karaoke",
            "videoke"
          ]
        },
        {
          "text": "Bandera / dekorasyon",
          "points": 18,
          "aliases": [
            "bandera / dekorasyon",
            "banderitas",
            "decorations"
          ]
        },
        {
          "text": "Program / palaro",
          "points": 14,
          "aliases": [
            "contest",
            "games",
            "program / palaro"
          ]
        },
        {
          "text": "Mga tao / bisita",
          "points": 12,
          "aliases": [
            "crowd",
            "guests",
            "mga tao / bisita"
          ]
        },
        {
          "text": "Prusisyon / parade",
          "points": 8,
          "aliases": [
            "parade",
            "prusisyon",
            "prusisyon / parade"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-1",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas makita kapag Pasko?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-2",
      "category": "CELEBRATIONS",
      "prompt": "Kapag nasa Pasko, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-3",
      "category": "CELEBRATIONS",
      "prompt": "Magbanggit ng bagay na normal makita kapag Pasko.",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-4",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang unang napapansin ng tao kapag Pasko?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-5",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang laging present kapag Pasko?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-6",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang asahan mong makikita kapag Pasko?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-7",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang common na tanawin kapag Pasko?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-8",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas laman o present kapag Pasko?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-9",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang halos hindi nawawala kapag Pasko?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "christmas-celebration-10",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang palaging nandiyan kapag Pasko?",
      "answers": [
        {
          "text": "Parol / ilaw",
          "points": 30,
          "aliases": [
            "lights",
            "parol",
            "parol / ilaw"
          ]
        },
        {
          "text": "Regalo",
          "points": 22,
          "aliases": [
            "gift",
            "regalo"
          ]
        },
        {
          "text": "Noche Buena food",
          "points": 17,
          "aliases": [
            "food",
            "handa",
            "noche buena food"
          ]
        },
        {
          "text": "Christmas tree",
          "points": 13,
          "aliases": [
            "christmas tree",
            "tree"
          ]
        },
        {
          "text": "Christmas songs",
          "points": 10,
          "aliases": [
            "carols",
            "christmas songs"
          ]
        },
        {
          "text": "Pamilya",
          "points": 8,
          "aliases": [
            "family",
            "pamilya"
          ]
        }
      ]
    },
    {
      "id": "wedding-1",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas makita sa kasal?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-2",
      "category": "CELEBRATIONS",
      "prompt": "Kapag nasa kasal, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-3",
      "category": "CELEBRATIONS",
      "prompt": "Magbanggit ng bagay na normal makita sa kasal.",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-4",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang unang napapansin ng tao sa kasal?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-5",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang laging present sa kasal?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-6",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang asahan mong makikita sa kasal?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-7",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang common na tanawin sa kasal?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-8",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas laman o present sa kasal?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-9",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang halos hindi nawawala sa kasal?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "wedding-10",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang palaging nandiyan sa kasal?",
      "answers": [
        {
          "text": "Bride",
          "points": 28,
          "aliases": [
            "bride"
          ]
        },
        {
          "text": "Groom",
          "points": 21,
          "aliases": [
            "groom"
          ]
        },
        {
          "text": "Cake",
          "points": 17,
          "aliases": [
            "cake",
            "wedding cake"
          ]
        },
        {
          "text": "Flowers",
          "points": 14,
          "aliases": [
            "bulaklak",
            "flowers"
          ]
        },
        {
          "text": "Guests",
          "points": 11,
          "aliases": [
            "bisita",
            "guests"
          ]
        },
        {
          "text": "Photographer / videographer",
          "points": 9,
          "aliases": [
            "photographer",
            "photographer / videographer",
            "video"
          ]
        }
      ]
    },
    {
      "id": "graduation-1",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas makita sa graduation?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-2",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag nasa graduation, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-3",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng bagay na normal makita sa graduation.",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang unang napapansin ng tao sa graduation?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-5",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang laging present sa graduation?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-6",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang asahan mong makikita sa graduation?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na tanawin sa graduation?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas laman o present sa graduation?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-9",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang halos hindi nawawala sa graduation?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "graduation-10",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang palaging nandiyan sa graduation?",
      "answers": [
        {
          "text": "Toga",
          "points": 32,
          "aliases": [
            "graduation gown",
            "toga"
          ]
        },
        {
          "text": "Diploma",
          "points": 20,
          "aliases": [
            "certificate",
            "diploma"
          ]
        },
        {
          "text": "Medal",
          "points": 16,
          "aliases": [
            "awards",
            "medal"
          ]
        },
        {
          "text": "Parents / family",
          "points": 12,
          "aliases": [
            "family",
            "parents / family"
          ]
        },
        {
          "text": "Bouquet / flowers",
          "points": 11,
          "aliases": [
            "bouquet",
            "bouquet / flowers",
            "flowers"
          ]
        },
        {
          "text": "Pictures",
          "points": 9,
          "aliases": [
            "photos",
            "picture",
            "pictures"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-1",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang madalas makita sa computer shop?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-2",
      "category": "TECH & GADGETS",
      "prompt": "Kapag nasa computer shop, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-3",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng bagay na normal makita sa computer shop.",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-4",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang unang napapansin ng tao sa computer shop?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-5",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang laging present sa computer shop?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-6",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang asahan mong makikita sa computer shop?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-7",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang common na tanawin sa computer shop?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-8",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang madalas laman o present sa computer shop?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-9",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang halos hindi nawawala sa computer shop?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "computer-shop-10",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang palaging nandiyan sa computer shop?",
      "answers": [
        {
          "text": "Computers",
          "points": 27,
          "aliases": [
            "computer",
            "computers",
            "pc"
          ]
        },
        {
          "text": "Gamers / players",
          "points": 22,
          "aliases": [
            "gamers",
            "gamers / players",
            "players"
          ]
        },
        {
          "text": "Headsets",
          "points": 18,
          "aliases": [
            "headset",
            "headsets"
          ]
        },
        {
          "text": "Keyboard at mouse",
          "points": 13,
          "aliases": [
            "keyboard",
            "keyboard at mouse",
            "mouse"
          ]
        },
        {
          "text": "Snacks / drinks",
          "points": 11,
          "aliases": [
            "drinks",
            "snacks",
            "snacks / drinks"
          ]
        },
        {
          "text": "Bills / timer screen",
          "points": 9,
          "aliases": [
            "bills",
            "bills / timer screen",
            "timer"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-1",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang madalas makita sa basketball court?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-2",
      "category": "SPORTS & FUN",
      "prompt": "Kapag nasa basketball court, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-3",
      "category": "SPORTS & FUN",
      "prompt": "Magbanggit ng bagay na normal makita sa basketball court.",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-4",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang unang napapansin ng tao sa basketball court?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-5",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang laging present sa basketball court?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-6",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang asahan mong makikita sa basketball court?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-7",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang common na tanawin sa basketball court?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-8",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang madalas laman o present sa basketball court?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-9",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang halos hindi nawawala sa basketball court?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "basketball-court-10",
      "category": "SPORTS & FUN",
      "prompt": "Ano ang palaging nandiyan sa basketball court?",
      "answers": [
        {
          "text": "Basketball",
          "points": 29,
          "aliases": [
            "ball",
            "basketball"
          ]
        },
        {
          "text": "Players",
          "points": 21,
          "aliases": [
            "mga naglalaro",
            "players"
          ]
        },
        {
          "text": "Ring / hoop",
          "points": 16,
          "aliases": [
            "hoop",
            "ring",
            "ring / hoop"
          ]
        },
        {
          "text": "Crowd / nanonood",
          "points": 13,
          "aliases": [
            "audience",
            "crowd",
            "crowd / nanonood"
          ]
        },
        {
          "text": "Referee",
          "points": 12,
          "aliases": [
            "ref",
            "referee"
          ]
        },
        {
          "text": "Scoreboard",
          "points": 9,
          "aliases": [
            "score board",
            "scoreboard"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-1",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas makita sa beach resort?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-2",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Kapag nasa beach resort, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-3",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng bagay na normal makita sa beach resort.",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-4",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang unang napapansin ng tao sa beach resort?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-5",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang laging present sa beach resort?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-6",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang asahan mong makikita sa beach resort?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-7",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang common na tanawin sa beach resort?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-8",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas laman o present sa beach resort?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-9",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang halos hindi nawawala sa beach resort?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "beach-resort-10",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang palaging nandiyan sa beach resort?",
      "answers": [
        {
          "text": "Buhangin",
          "points": 26,
          "aliases": [
            "buhangin",
            "sand"
          ]
        },
        {
          "text": "Dagat",
          "points": 22,
          "aliases": [
            "dagat",
            "ocean",
            "sea"
          ]
        },
        {
          "text": "Cottages",
          "points": 18,
          "aliases": [
            "cottage",
            "cottages"
          ]
        },
        {
          "text": "Naliligo / swimmers",
          "points": 14,
          "aliases": [
            "naliligo / swimmers",
            "people",
            "swimmers"
          ]
        },
        {
          "text": "Salbabida",
          "points": 12,
          "aliases": [
            "floater",
            "life vest",
            "salbabida"
          ]
        },
        {
          "text": "Pagkain / ihawan",
          "points": 8,
          "aliases": [
            "food",
            "grill",
            "pagkain / ihawan"
          ]
        }
      ]
    },
    {
      "id": "airport-1",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas makita sa airport?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-2",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Kapag nasa airport, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-3",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng bagay na normal makita sa airport.",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-4",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang unang napapansin ng tao sa airport?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-5",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang laging present sa airport?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-6",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang asahan mong makikita sa airport?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-7",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang common na tanawin sa airport?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-8",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas laman o present sa airport?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-9",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang halos hindi nawawala sa airport?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "airport-10",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang palaging nandiyan sa airport?",
      "answers": [
        {
          "text": "Eroplano",
          "points": 30,
          "aliases": [
            "airplane",
            "eroplano",
            "plane"
          ]
        },
        {
          "text": "Maleta",
          "points": 22,
          "aliases": [
            "bag",
            "luggage",
            "maleta"
          ]
        },
        {
          "text": "Check-in counter",
          "points": 17,
          "aliases": [
            "check in",
            "check-in counter",
            "counter"
          ]
        },
        {
          "text": "Passengers",
          "points": 13,
          "aliases": [
            "passengers",
            "travellers"
          ]
        },
        {
          "text": "Boarding pass",
          "points": 10,
          "aliases": [
            "boarding pass",
            "ticket"
          ]
        },
        {
          "text": "Security check",
          "points": 8,
          "aliases": [
            "security",
            "security check"
          ]
        }
      ]
    },
    {
      "id": "classroom-1",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas makita sa classroom?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-2",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag nasa classroom, ano ang karaniwang mapapansin?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-3",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng bagay na normal makita sa classroom.",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang unang napapansin ng tao sa classroom?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-5",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang laging present sa classroom?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-6",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang asahan mong makikita sa classroom?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na tanawin sa classroom?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas laman o present sa classroom?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-9",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang halos hindi nawawala sa classroom?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "classroom-10",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang palaging nandiyan sa classroom?",
      "answers": [
        {
          "text": "Blackboard / whiteboard",
          "points": 28,
          "aliases": [
            "blackboard / whiteboard",
            "board"
          ]
        },
        {
          "text": "Desks / chairs",
          "points": 21,
          "aliases": [
            "chair",
            "desk",
            "desks / chairs"
          ]
        },
        {
          "text": "Teacher",
          "points": 17,
          "aliases": [
            "maam",
            "sir",
            "teacher"
          ]
        },
        {
          "text": "Students",
          "points": 14,
          "aliases": [
            "classmates",
            "students"
          ]
        },
        {
          "text": "Projector / TV",
          "points": 11,
          "aliases": [
            "projector",
            "projector / tv",
            "screen"
          ]
        },
        {
          "text": "School supplies",
          "points": 9,
          "aliases": [
            "books",
            "notebooks",
            "school supplies"
          ]
        }
      ]
    },
    {
      "id": "almusal-1",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kainin ng tao sa almusal?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-2",
      "category": "FOOD & DRINK",
      "prompt": "Magbanggit ng pagkaing karaniwang hinahanap sa almusal.",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-3",
      "category": "FOOD & DRINK",
      "prompt": "Kapag sa almusal, ano ang unang gustong kainin?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-4",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang common na pagkain sa almusal?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-5",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang paboritong ihain o kainin sa almusal?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-6",
      "category": "FOOD & DRINK",
      "prompt": "Anong food ang halos laging meron sa almusal?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-7",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkaing madalas orderin o bilhin sa almusal?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-8",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang nakaka-relate na pagkain sa almusal?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-9",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kasama sa kainan sa almusal?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "almusal-10",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkain na inaasahan ng tao sa almusal?",
      "answers": [
        {
          "text": "Itlog",
          "points": 32,
          "aliases": [
            "egg",
            "eggs",
            "itlog"
          ]
        },
        {
          "text": "Pandesal",
          "points": 20,
          "aliases": [
            "bread",
            "pandesal"
          ]
        },
        {
          "text": "Kape",
          "points": 16,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Hotdog / tocino",
          "points": 12,
          "aliases": [
            "hotdog",
            "hotdog / tocino",
            "tocino"
          ]
        },
        {
          "text": "Champorado / lugaw",
          "points": 11,
          "aliases": [
            "champorado",
            "champorado / lugaw",
            "lugaw"
          ]
        },
        {
          "text": "Kanin",
          "points": 9,
          "aliases": [
            "kanin",
            "rice"
          ]
        }
      ]
    },
    {
      "id": "merienda-1",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kainin ng tao kapag merienda?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-2",
      "category": "FOOD & DRINK",
      "prompt": "Magbanggit ng pagkaing karaniwang hinahanap kapag merienda.",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-3",
      "category": "FOOD & DRINK",
      "prompt": "Kapag kapag merienda, ano ang unang gustong kainin?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-4",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang common na pagkain kapag merienda?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-5",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang paboritong ihain o kainin kapag merienda?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-6",
      "category": "FOOD & DRINK",
      "prompt": "Anong food ang halos laging meron kapag merienda?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-7",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkaing madalas orderin o bilhin kapag merienda?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-8",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang nakaka-relate na pagkain kapag merienda?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-9",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kasama sa kainan kapag merienda?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "merienda-10",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkain na inaasahan ng tao kapag merienda?",
      "answers": [
        {
          "text": "Tinapay",
          "points": 27,
          "aliases": [
            "bread",
            "tinapay"
          ]
        },
        {
          "text": "Pancit canton / noodles",
          "points": 22,
          "aliases": [
            "noodles",
            "pancit canton",
            "pancit canton / noodles"
          ]
        },
        {
          "text": "Biskwit",
          "points": 18,
          "aliases": [
            "biscuits",
            "biskwit",
            "cookies"
          ]
        },
        {
          "text": "Prutas",
          "points": 13,
          "aliases": [
            "fruits",
            "prutas"
          ]
        },
        {
          "text": "Kape / gatas",
          "points": 11,
          "aliases": [
            "coffee",
            "kape / gatas",
            "milk"
          ]
        },
        {
          "text": "Banana cue / kakanin",
          "points": 9,
          "aliases": [
            "banana cue",
            "banana cue / kakanin",
            "kakanin"
          ]
        }
      ]
    },
    {
      "id": "handaan-1",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kainin ng tao sa handaan?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-2",
      "category": "FOOD & DRINK",
      "prompt": "Magbanggit ng pagkaing karaniwang hinahanap sa handaan.",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-3",
      "category": "FOOD & DRINK",
      "prompt": "Kapag sa handaan, ano ang unang gustong kainin?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-4",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang common na pagkain sa handaan?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-5",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang paboritong ihain o kainin sa handaan?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-6",
      "category": "FOOD & DRINK",
      "prompt": "Anong food ang halos laging meron sa handaan?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-7",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkaing madalas orderin o bilhin sa handaan?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-8",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang nakaka-relate na pagkain sa handaan?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-9",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kasama sa kainan sa handaan?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "handaan-10",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkain na inaasahan ng tao sa handaan?",
      "answers": [
        {
          "text": "Spaghetti",
          "points": 29,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fried chicken",
          "points": 21,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Lumpia",
          "points": 16,
          "aliases": [
            "lumpia",
            "spring rolls"
          ]
        },
        {
          "text": "Cake",
          "points": 13,
          "aliases": [
            "cake"
          ]
        },
        {
          "text": "Rice",
          "points": 12,
          "aliases": [
            "kanin",
            "rice"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 9,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-1",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kainin ng tao kapag sobrang init ng araw?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-2",
      "category": "FOOD & DRINK",
      "prompt": "Magbanggit ng pagkaing karaniwang hinahanap kapag sobrang init ng araw.",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-3",
      "category": "FOOD & DRINK",
      "prompt": "Kapag kapag sobrang init ng araw, ano ang unang gustong kainin?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-4",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang common na pagkain kapag sobrang init ng araw?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-5",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang paboritong ihain o kainin kapag sobrang init ng araw?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-6",
      "category": "FOOD & DRINK",
      "prompt": "Anong food ang halos laging meron kapag sobrang init ng araw?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-7",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkaing madalas orderin o bilhin kapag sobrang init ng araw?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-8",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang nakaka-relate na pagkain kapag sobrang init ng araw?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-9",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kasama sa kainan kapag sobrang init ng araw?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "mainit-na-araw-10",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkain na inaasahan ng tao kapag sobrang init ng araw?",
      "answers": [
        {
          "text": "Halo-halo",
          "points": 26,
          "aliases": [
            "dessert",
            "halo-halo"
          ]
        },
        {
          "text": "Ice cream",
          "points": 22,
          "aliases": [
            "ice cream",
            "icecream"
          ]
        },
        {
          "text": "Palamig / juice",
          "points": 18,
          "aliases": [
            "cold drink",
            "juice",
            "palamig / juice"
          ]
        },
        {
          "text": "Tubig",
          "points": 14,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Watermelon",
          "points": 12,
          "aliases": [
            "melon",
            "watermelon"
          ]
        },
        {
          "text": "Mais con yelo",
          "points": 8,
          "aliases": [
            "dessert",
            "mais con yelo"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-1",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kainin ng tao kapag maulan at malamig?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-2",
      "category": "FOOD & DRINK",
      "prompt": "Magbanggit ng pagkaing karaniwang hinahanap kapag maulan at malamig.",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-3",
      "category": "FOOD & DRINK",
      "prompt": "Kapag kapag maulan at malamig, ano ang unang gustong kainin?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-4",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang common na pagkain kapag maulan at malamig?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-5",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang paboritong ihain o kainin kapag maulan at malamig?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-6",
      "category": "FOOD & DRINK",
      "prompt": "Anong food ang halos laging meron kapag maulan at malamig?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-7",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkaing madalas orderin o bilhin kapag maulan at malamig?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-8",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang nakaka-relate na pagkain kapag maulan at malamig?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-9",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas kasama sa kainan kapag maulan at malamig?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "maulang-gabi-10",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang pagkain na inaasahan ng tao kapag maulan at malamig?",
      "answers": [
        {
          "text": "Lugaw",
          "points": 30,
          "aliases": [
            "lugaw",
            "porridge"
          ]
        },
        {
          "text": "Sopas",
          "points": 22,
          "aliases": [
            "sopas",
            "soup"
          ]
        },
        {
          "text": "Champorado",
          "points": 17,
          "aliases": [
            "champorado",
            "choco porridge"
          ]
        },
        {
          "text": "Instant noodles",
          "points": 13,
          "aliases": [
            "instant noodles",
            "mami",
            "noodles"
          ]
        },
        {
          "text": "Kape",
          "points": 10,
          "aliases": [
            "coffee",
            "kape"
          ]
        },
        {
          "text": "Tinapay",
          "points": 8,
          "aliases": [
            "bread",
            "tinapay"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-1",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas kainin ng tao kapag huminto sa biyahe para kumain?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-2",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng pagkaing karaniwang hinahanap kapag huminto sa biyahe para kumain.",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-3",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Kapag kapag huminto sa biyahe para kumain, ano ang unang gustong kainin?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-4",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang common na pagkain kapag huminto sa biyahe para kumain?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-5",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang paboritong ihain o kainin kapag huminto sa biyahe para kumain?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-6",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Anong food ang halos laging meron kapag huminto sa biyahe para kumain?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-7",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang pagkaing madalas orderin o bilhin kapag huminto sa biyahe para kumain?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-8",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang nakaka-relate na pagkain kapag huminto sa biyahe para kumain?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-9",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas kasama sa kainan kapag huminto sa biyahe para kumain?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "road-trip-stopover-10",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang pagkain na inaasahan ng tao kapag huminto sa biyahe para kumain?",
      "answers": [
        {
          "text": "Fried chicken",
          "points": 28,
          "aliases": [
            "chicken",
            "fried chicken"
          ]
        },
        {
          "text": "Burger / sandwich",
          "points": 21,
          "aliases": [
            "burger",
            "burger / sandwich",
            "sandwich"
          ]
        },
        {
          "text": "Rice meal",
          "points": 17,
          "aliases": [
            "meal",
            "rice",
            "rice meal"
          ]
        },
        {
          "text": "Softdrinks / juice",
          "points": 14,
          "aliases": [
            "drink",
            "juice",
            "softdrinks / juice"
          ]
        },
        {
          "text": "Fries",
          "points": 11,
          "aliases": [
            "french fries",
            "fries"
          ]
        },
        {
          "text": "Coffee",
          "points": 9,
          "aliases": [
            "coffee",
            "kape"
          ]
        }
      ]
    },
    {
      "id": "movie-night-1",
      "category": "ENTERTAINMENT",
      "prompt": "Ano ang madalas kainin ng tao kapag movie night?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-2",
      "category": "ENTERTAINMENT",
      "prompt": "Magbanggit ng pagkaing karaniwang hinahanap kapag movie night.",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-3",
      "category": "ENTERTAINMENT",
      "prompt": "Kapag kapag movie night, ano ang unang gustong kainin?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-4",
      "category": "ENTERTAINMENT",
      "prompt": "Ano ang common na pagkain kapag movie night?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-5",
      "category": "ENTERTAINMENT",
      "prompt": "Ano ang paboritong ihain o kainin kapag movie night?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-6",
      "category": "ENTERTAINMENT",
      "prompt": "Anong food ang halos laging meron kapag movie night?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-7",
      "category": "ENTERTAINMENT",
      "prompt": "Ano ang pagkaing madalas orderin o bilhin kapag movie night?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-8",
      "category": "ENTERTAINMENT",
      "prompt": "Ano ang nakaka-relate na pagkain kapag movie night?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-9",
      "category": "ENTERTAINMENT",
      "prompt": "Ano ang madalas kasama sa kainan kapag movie night?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "movie-night-10",
      "category": "ENTERTAINMENT",
      "prompt": "Ano ang pagkain na inaasahan ng tao kapag movie night?",
      "answers": [
        {
          "text": "Popcorn",
          "points": 32,
          "aliases": [
            "pop corn",
            "popcorn"
          ]
        },
        {
          "text": "Softdrinks",
          "points": 20,
          "aliases": [
            "soda",
            "softdrinks"
          ]
        },
        {
          "text": "Chips",
          "points": 16,
          "aliases": [
            "chichirya",
            "chips"
          ]
        },
        {
          "text": "Pizza",
          "points": 12,
          "aliases": [
            "pizza"
          ]
        },
        {
          "text": "Chocolate",
          "points": 11,
          "aliases": [
            "candy",
            "chocolate"
          ]
        },
        {
          "text": "Hotdog sandwich",
          "points": 9,
          "aliases": [
            "hotdog sandwich",
            "sandwich"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-1",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas kainin ng tao sa Noche Buena?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-2",
      "category": "CELEBRATIONS",
      "prompt": "Magbanggit ng pagkaing karaniwang hinahanap sa Noche Buena.",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-3",
      "category": "CELEBRATIONS",
      "prompt": "Kapag sa Noche Buena, ano ang unang gustong kainin?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-4",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang common na pagkain sa Noche Buena?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-5",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang paboritong ihain o kainin sa Noche Buena?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-6",
      "category": "CELEBRATIONS",
      "prompt": "Anong food ang halos laging meron sa Noche Buena?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-7",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang pagkaing madalas orderin o bilhin sa Noche Buena?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-8",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang nakaka-relate na pagkain sa Noche Buena?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-9",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas kasama sa kainan sa Noche Buena?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "noche-buena-10",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang pagkain na inaasahan ng tao sa Noche Buena?",
      "answers": [
        {
          "text": "Ham",
          "points": 27,
          "aliases": [
            "ham",
            "hamon"
          ]
        },
        {
          "text": "Spaghetti",
          "points": 22,
          "aliases": [
            "pasta",
            "spaghetti"
          ]
        },
        {
          "text": "Fruit salad",
          "points": 18,
          "aliases": [
            "fruit salad",
            "salad"
          ]
        },
        {
          "text": "Queso de bola",
          "points": 13,
          "aliases": [
            "cheese",
            "queso de bola"
          ]
        },
        {
          "text": "Lechon / roast",
          "points": 11,
          "aliases": [
            "lechon",
            "lechon / roast"
          ]
        },
        {
          "text": "Cake",
          "points": 9,
          "aliases": [
            "cake"
          ]
        }
      ]
    },
    {
      "id": "rainy-weather-1",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang madalas isuot ng tao kapag maulan?",
      "answers": [
        {
          "text": "Jacket / Hoodie",
          "points": 29,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Raincoat",
          "points": 21,
          "aliases": [
            "kapote",
            "raincoat"
          ]
        },
        {
          "text": "Tsinelas / sandals",
          "points": 16,
          "aliases": [
            "sandals",
            "slippers",
            "tsinelas / sandals"
          ]
        },
        {
          "text": "Pants",
          "points": 13,
          "aliases": [
            "jeans",
            "pants"
          ]
        },
        {
          "text": "Payong",
          "points": 12,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Bonnet / cap",
          "points": 9,
          "aliases": [
            "bonnet / cap",
            "cap",
            "hat"
          ]
        }
      ]
    },
    {
      "id": "rainy-weather-2",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Kapag kapag maulan, ano ang karaniwang suot?",
      "answers": [
        {
          "text": "Jacket / Hoodie",
          "points": 29,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Raincoat",
          "points": 21,
          "aliases": [
            "kapote",
            "raincoat"
          ]
        },
        {
          "text": "Tsinelas / sandals",
          "points": 16,
          "aliases": [
            "sandals",
            "slippers",
            "tsinelas / sandals"
          ]
        },
        {
          "text": "Pants",
          "points": 13,
          "aliases": [
            "jeans",
            "pants"
          ]
        },
        {
          "text": "Payong",
          "points": 12,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Bonnet / cap",
          "points": 9,
          "aliases": [
            "bonnet / cap",
            "cap",
            "hat"
          ]
        }
      ]
    },
    {
      "id": "rainy-weather-3",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Magbanggit ng damit o gamit na sinusuot kapag maulan.",
      "answers": [
        {
          "text": "Jacket / Hoodie",
          "points": 29,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Raincoat",
          "points": 21,
          "aliases": [
            "kapote",
            "raincoat"
          ]
        },
        {
          "text": "Tsinelas / sandals",
          "points": 16,
          "aliases": [
            "sandals",
            "slippers",
            "tsinelas / sandals"
          ]
        },
        {
          "text": "Pants",
          "points": 13,
          "aliases": [
            "jeans",
            "pants"
          ]
        },
        {
          "text": "Payong",
          "points": 12,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Bonnet / cap",
          "points": 9,
          "aliases": [
            "bonnet / cap",
            "cap",
            "hat"
          ]
        }
      ]
    },
    {
      "id": "rainy-weather-4",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang common na outfit kapag maulan?",
      "answers": [
        {
          "text": "Jacket / Hoodie",
          "points": 29,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Raincoat",
          "points": 21,
          "aliases": [
            "kapote",
            "raincoat"
          ]
        },
        {
          "text": "Tsinelas / sandals",
          "points": 16,
          "aliases": [
            "sandals",
            "slippers",
            "tsinelas / sandals"
          ]
        },
        {
          "text": "Pants",
          "points": 13,
          "aliases": [
            "jeans",
            "pants"
          ]
        },
        {
          "text": "Payong",
          "points": 12,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Bonnet / cap",
          "points": 9,
          "aliases": [
            "bonnet / cap",
            "cap",
            "hat"
          ]
        }
      ]
    },
    {
      "id": "rainy-weather-5",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang unang sinusuot ng tao kapag maulan?",
      "answers": [
        {
          "text": "Jacket / Hoodie",
          "points": 29,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Raincoat",
          "points": 21,
          "aliases": [
            "kapote",
            "raincoat"
          ]
        },
        {
          "text": "Tsinelas / sandals",
          "points": 16,
          "aliases": [
            "sandals",
            "slippers",
            "tsinelas / sandals"
          ]
        },
        {
          "text": "Pants",
          "points": 13,
          "aliases": [
            "jeans",
            "pants"
          ]
        },
        {
          "text": "Payong",
          "points": 12,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Bonnet / cap",
          "points": 9,
          "aliases": [
            "bonnet / cap",
            "cap",
            "hat"
          ]
        }
      ]
    },
    {
      "id": "rainy-weather-6",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang kadalasang parte ng getup kapag maulan?",
      "answers": [
        {
          "text": "Jacket / Hoodie",
          "points": 29,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Raincoat",
          "points": 21,
          "aliases": [
            "kapote",
            "raincoat"
          ]
        },
        {
          "text": "Tsinelas / sandals",
          "points": 16,
          "aliases": [
            "sandals",
            "slippers",
            "tsinelas / sandals"
          ]
        },
        {
          "text": "Pants",
          "points": 13,
          "aliases": [
            "jeans",
            "pants"
          ]
        },
        {
          "text": "Payong",
          "points": 12,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Bonnet / cap",
          "points": 9,
          "aliases": [
            "bonnet / cap",
            "cap",
            "hat"
          ]
        }
      ]
    },
    {
      "id": "rainy-weather-7",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang madalas kasama sa kasuotan kapag maulan?",
      "answers": [
        {
          "text": "Jacket / Hoodie",
          "points": 29,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Raincoat",
          "points": 21,
          "aliases": [
            "kapote",
            "raincoat"
          ]
        },
        {
          "text": "Tsinelas / sandals",
          "points": 16,
          "aliases": [
            "sandals",
            "slippers",
            "tsinelas / sandals"
          ]
        },
        {
          "text": "Pants",
          "points": 13,
          "aliases": [
            "jeans",
            "pants"
          ]
        },
        {
          "text": "Payong",
          "points": 12,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Bonnet / cap",
          "points": 9,
          "aliases": [
            "bonnet / cap",
            "cap",
            "hat"
          ]
        }
      ]
    },
    {
      "id": "rainy-weather-8",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang bagay na suot ng marami kapag maulan?",
      "answers": [
        {
          "text": "Jacket / Hoodie",
          "points": 29,
          "aliases": [
            "hoodie",
            "jacket",
            "jacket / hoodie"
          ]
        },
        {
          "text": "Raincoat",
          "points": 21,
          "aliases": [
            "kapote",
            "raincoat"
          ]
        },
        {
          "text": "Tsinelas / sandals",
          "points": 16,
          "aliases": [
            "sandals",
            "slippers",
            "tsinelas / sandals"
          ]
        },
        {
          "text": "Pants",
          "points": 13,
          "aliases": [
            "jeans",
            "pants"
          ]
        },
        {
          "text": "Payong",
          "points": 12,
          "aliases": [
            "payong",
            "umbrella"
          ]
        },
        {
          "text": "Bonnet / cap",
          "points": 9,
          "aliases": [
            "bonnet / cap",
            "cap",
            "hat"
          ]
        }
      ]
    },
    {
      "id": "beach-wear-1",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas isuot ng tao kapag nasa beach?",
      "answers": [
        {
          "text": "Swimsuit",
          "points": 26,
          "aliases": [
            "onepiece",
            "swimsuit",
            "swimwear"
          ]
        },
        {
          "text": "Shorts",
          "points": 22,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "T-shirt / cover up",
          "points": 18,
          "aliases": [
            "cover up",
            "shirt",
            "t-shirt / cover up"
          ]
        },
        {
          "text": "Slippers",
          "points": 14,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Hat / cap",
          "points": 12,
          "aliases": [
            "cap",
            "hat",
            "hat / cap"
          ]
        },
        {
          "text": "Sunglasses",
          "points": 8,
          "aliases": [
            "glasses",
            "sunglasses"
          ]
        }
      ]
    },
    {
      "id": "beach-wear-2",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Kapag kapag nasa beach, ano ang karaniwang suot?",
      "answers": [
        {
          "text": "Swimsuit",
          "points": 26,
          "aliases": [
            "onepiece",
            "swimsuit",
            "swimwear"
          ]
        },
        {
          "text": "Shorts",
          "points": 22,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "T-shirt / cover up",
          "points": 18,
          "aliases": [
            "cover up",
            "shirt",
            "t-shirt / cover up"
          ]
        },
        {
          "text": "Slippers",
          "points": 14,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Hat / cap",
          "points": 12,
          "aliases": [
            "cap",
            "hat",
            "hat / cap"
          ]
        },
        {
          "text": "Sunglasses",
          "points": 8,
          "aliases": [
            "glasses",
            "sunglasses"
          ]
        }
      ]
    },
    {
      "id": "beach-wear-3",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng damit o gamit na sinusuot kapag nasa beach.",
      "answers": [
        {
          "text": "Swimsuit",
          "points": 26,
          "aliases": [
            "onepiece",
            "swimsuit",
            "swimwear"
          ]
        },
        {
          "text": "Shorts",
          "points": 22,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "T-shirt / cover up",
          "points": 18,
          "aliases": [
            "cover up",
            "shirt",
            "t-shirt / cover up"
          ]
        },
        {
          "text": "Slippers",
          "points": 14,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Hat / cap",
          "points": 12,
          "aliases": [
            "cap",
            "hat",
            "hat / cap"
          ]
        },
        {
          "text": "Sunglasses",
          "points": 8,
          "aliases": [
            "glasses",
            "sunglasses"
          ]
        }
      ]
    },
    {
      "id": "beach-wear-4",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang common na outfit kapag nasa beach?",
      "answers": [
        {
          "text": "Swimsuit",
          "points": 26,
          "aliases": [
            "onepiece",
            "swimsuit",
            "swimwear"
          ]
        },
        {
          "text": "Shorts",
          "points": 22,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "T-shirt / cover up",
          "points": 18,
          "aliases": [
            "cover up",
            "shirt",
            "t-shirt / cover up"
          ]
        },
        {
          "text": "Slippers",
          "points": 14,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Hat / cap",
          "points": 12,
          "aliases": [
            "cap",
            "hat",
            "hat / cap"
          ]
        },
        {
          "text": "Sunglasses",
          "points": 8,
          "aliases": [
            "glasses",
            "sunglasses"
          ]
        }
      ]
    },
    {
      "id": "beach-wear-5",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang unang sinusuot ng tao kapag nasa beach?",
      "answers": [
        {
          "text": "Swimsuit",
          "points": 26,
          "aliases": [
            "onepiece",
            "swimsuit",
            "swimwear"
          ]
        },
        {
          "text": "Shorts",
          "points": 22,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "T-shirt / cover up",
          "points": 18,
          "aliases": [
            "cover up",
            "shirt",
            "t-shirt / cover up"
          ]
        },
        {
          "text": "Slippers",
          "points": 14,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Hat / cap",
          "points": 12,
          "aliases": [
            "cap",
            "hat",
            "hat / cap"
          ]
        },
        {
          "text": "Sunglasses",
          "points": 8,
          "aliases": [
            "glasses",
            "sunglasses"
          ]
        }
      ]
    },
    {
      "id": "beach-wear-6",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang kadalasang parte ng getup kapag nasa beach?",
      "answers": [
        {
          "text": "Swimsuit",
          "points": 26,
          "aliases": [
            "onepiece",
            "swimsuit",
            "swimwear"
          ]
        },
        {
          "text": "Shorts",
          "points": 22,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "T-shirt / cover up",
          "points": 18,
          "aliases": [
            "cover up",
            "shirt",
            "t-shirt / cover up"
          ]
        },
        {
          "text": "Slippers",
          "points": 14,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Hat / cap",
          "points": 12,
          "aliases": [
            "cap",
            "hat",
            "hat / cap"
          ]
        },
        {
          "text": "Sunglasses",
          "points": 8,
          "aliases": [
            "glasses",
            "sunglasses"
          ]
        }
      ]
    },
    {
      "id": "beach-wear-7",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas kasama sa kasuotan kapag nasa beach?",
      "answers": [
        {
          "text": "Swimsuit",
          "points": 26,
          "aliases": [
            "onepiece",
            "swimsuit",
            "swimwear"
          ]
        },
        {
          "text": "Shorts",
          "points": 22,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "T-shirt / cover up",
          "points": 18,
          "aliases": [
            "cover up",
            "shirt",
            "t-shirt / cover up"
          ]
        },
        {
          "text": "Slippers",
          "points": 14,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Hat / cap",
          "points": 12,
          "aliases": [
            "cap",
            "hat",
            "hat / cap"
          ]
        },
        {
          "text": "Sunglasses",
          "points": 8,
          "aliases": [
            "glasses",
            "sunglasses"
          ]
        }
      ]
    },
    {
      "id": "beach-wear-8",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang bagay na suot ng marami kapag nasa beach?",
      "answers": [
        {
          "text": "Swimsuit",
          "points": 26,
          "aliases": [
            "onepiece",
            "swimsuit",
            "swimwear"
          ]
        },
        {
          "text": "Shorts",
          "points": 22,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "T-shirt / cover up",
          "points": 18,
          "aliases": [
            "cover up",
            "shirt",
            "t-shirt / cover up"
          ]
        },
        {
          "text": "Slippers",
          "points": 14,
          "aliases": [
            "slippers",
            "tsinelas"
          ]
        },
        {
          "text": "Hat / cap",
          "points": 12,
          "aliases": [
            "cap",
            "hat",
            "hat / cap"
          ]
        },
        {
          "text": "Sunglasses",
          "points": 8,
          "aliases": [
            "glasses",
            "sunglasses"
          ]
        }
      ]
    },
    {
      "id": "pe-class-1",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas isuot ng tao kapag PE class?",
      "answers": [
        {
          "text": "PE uniform",
          "points": 30,
          "aliases": [
            "pe uniform",
            "uniform"
          ]
        },
        {
          "text": "Rubber shoes",
          "points": 22,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Shorts / jogging pants",
          "points": 17,
          "aliases": [
            "jogging pants",
            "shorts",
            "shorts / jogging pants"
          ]
        },
        {
          "text": "White shirt",
          "points": 13,
          "aliases": [
            "shirt",
            "white shirt"
          ]
        },
        {
          "text": "Socks",
          "points": 10,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Jacket",
          "points": 8,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        }
      ]
    },
    {
      "id": "pe-class-2",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag kapag PE class, ano ang karaniwang suot?",
      "answers": [
        {
          "text": "PE uniform",
          "points": 30,
          "aliases": [
            "pe uniform",
            "uniform"
          ]
        },
        {
          "text": "Rubber shoes",
          "points": 22,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Shorts / jogging pants",
          "points": 17,
          "aliases": [
            "jogging pants",
            "shorts",
            "shorts / jogging pants"
          ]
        },
        {
          "text": "White shirt",
          "points": 13,
          "aliases": [
            "shirt",
            "white shirt"
          ]
        },
        {
          "text": "Socks",
          "points": 10,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Jacket",
          "points": 8,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        }
      ]
    },
    {
      "id": "pe-class-3",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng damit o gamit na sinusuot kapag PE class.",
      "answers": [
        {
          "text": "PE uniform",
          "points": 30,
          "aliases": [
            "pe uniform",
            "uniform"
          ]
        },
        {
          "text": "Rubber shoes",
          "points": 22,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Shorts / jogging pants",
          "points": 17,
          "aliases": [
            "jogging pants",
            "shorts",
            "shorts / jogging pants"
          ]
        },
        {
          "text": "White shirt",
          "points": 13,
          "aliases": [
            "shirt",
            "white shirt"
          ]
        },
        {
          "text": "Socks",
          "points": 10,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Jacket",
          "points": 8,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        }
      ]
    },
    {
      "id": "pe-class-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na outfit kapag PE class?",
      "answers": [
        {
          "text": "PE uniform",
          "points": 30,
          "aliases": [
            "pe uniform",
            "uniform"
          ]
        },
        {
          "text": "Rubber shoes",
          "points": 22,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Shorts / jogging pants",
          "points": 17,
          "aliases": [
            "jogging pants",
            "shorts",
            "shorts / jogging pants"
          ]
        },
        {
          "text": "White shirt",
          "points": 13,
          "aliases": [
            "shirt",
            "white shirt"
          ]
        },
        {
          "text": "Socks",
          "points": 10,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Jacket",
          "points": 8,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        }
      ]
    },
    {
      "id": "pe-class-5",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang unang sinusuot ng tao kapag PE class?",
      "answers": [
        {
          "text": "PE uniform",
          "points": 30,
          "aliases": [
            "pe uniform",
            "uniform"
          ]
        },
        {
          "text": "Rubber shoes",
          "points": 22,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Shorts / jogging pants",
          "points": 17,
          "aliases": [
            "jogging pants",
            "shorts",
            "shorts / jogging pants"
          ]
        },
        {
          "text": "White shirt",
          "points": 13,
          "aliases": [
            "shirt",
            "white shirt"
          ]
        },
        {
          "text": "Socks",
          "points": 10,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Jacket",
          "points": 8,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        }
      ]
    },
    {
      "id": "pe-class-6",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang kadalasang parte ng getup kapag PE class?",
      "answers": [
        {
          "text": "PE uniform",
          "points": 30,
          "aliases": [
            "pe uniform",
            "uniform"
          ]
        },
        {
          "text": "Rubber shoes",
          "points": 22,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Shorts / jogging pants",
          "points": 17,
          "aliases": [
            "jogging pants",
            "shorts",
            "shorts / jogging pants"
          ]
        },
        {
          "text": "White shirt",
          "points": 13,
          "aliases": [
            "shirt",
            "white shirt"
          ]
        },
        {
          "text": "Socks",
          "points": 10,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Jacket",
          "points": 8,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        }
      ]
    },
    {
      "id": "pe-class-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas kasama sa kasuotan kapag PE class?",
      "answers": [
        {
          "text": "PE uniform",
          "points": 30,
          "aliases": [
            "pe uniform",
            "uniform"
          ]
        },
        {
          "text": "Rubber shoes",
          "points": 22,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Shorts / jogging pants",
          "points": 17,
          "aliases": [
            "jogging pants",
            "shorts",
            "shorts / jogging pants"
          ]
        },
        {
          "text": "White shirt",
          "points": 13,
          "aliases": [
            "shirt",
            "white shirt"
          ]
        },
        {
          "text": "Socks",
          "points": 10,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Jacket",
          "points": 8,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        }
      ]
    },
    {
      "id": "pe-class-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang bagay na suot ng marami kapag PE class?",
      "answers": [
        {
          "text": "PE uniform",
          "points": 30,
          "aliases": [
            "pe uniform",
            "uniform"
          ]
        },
        {
          "text": "Rubber shoes",
          "points": 22,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Shorts / jogging pants",
          "points": 17,
          "aliases": [
            "jogging pants",
            "shorts",
            "shorts / jogging pants"
          ]
        },
        {
          "text": "White shirt",
          "points": 13,
          "aliases": [
            "shirt",
            "white shirt"
          ]
        },
        {
          "text": "Socks",
          "points": 10,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Jacket",
          "points": 8,
          "aliases": [
            "hoodie",
            "jacket"
          ]
        }
      ]
    },
    {
      "id": "formal-event-1",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas isuot ng tao kapag formal event?",
      "answers": [
        {
          "text": "Dress",
          "points": 28,
          "aliases": [
            "dress",
            "gown"
          ]
        },
        {
          "text": "Polo / long sleeves",
          "points": 21,
          "aliases": [
            "long sleeves",
            "polo",
            "polo / long sleeves"
          ]
        },
        {
          "text": "Slacks",
          "points": 17,
          "aliases": [
            "pants",
            "slacks"
          ]
        },
        {
          "text": "Heels / formal shoes",
          "points": 14,
          "aliases": [
            "formal shoes",
            "heels",
            "heels / formal shoes"
          ]
        },
        {
          "text": "Necktie",
          "points": 11,
          "aliases": [
            "necktie",
            "tie"
          ]
        },
        {
          "text": "Accessories",
          "points": 9,
          "aliases": [
            "accessories",
            "jewelry"
          ]
        }
      ]
    },
    {
      "id": "formal-event-2",
      "category": "CELEBRATIONS",
      "prompt": "Kapag kapag formal event, ano ang karaniwang suot?",
      "answers": [
        {
          "text": "Dress",
          "points": 28,
          "aliases": [
            "dress",
            "gown"
          ]
        },
        {
          "text": "Polo / long sleeves",
          "points": 21,
          "aliases": [
            "long sleeves",
            "polo",
            "polo / long sleeves"
          ]
        },
        {
          "text": "Slacks",
          "points": 17,
          "aliases": [
            "pants",
            "slacks"
          ]
        },
        {
          "text": "Heels / formal shoes",
          "points": 14,
          "aliases": [
            "formal shoes",
            "heels",
            "heels / formal shoes"
          ]
        },
        {
          "text": "Necktie",
          "points": 11,
          "aliases": [
            "necktie",
            "tie"
          ]
        },
        {
          "text": "Accessories",
          "points": 9,
          "aliases": [
            "accessories",
            "jewelry"
          ]
        }
      ]
    },
    {
      "id": "formal-event-3",
      "category": "CELEBRATIONS",
      "prompt": "Magbanggit ng damit o gamit na sinusuot kapag formal event.",
      "answers": [
        {
          "text": "Dress",
          "points": 28,
          "aliases": [
            "dress",
            "gown"
          ]
        },
        {
          "text": "Polo / long sleeves",
          "points": 21,
          "aliases": [
            "long sleeves",
            "polo",
            "polo / long sleeves"
          ]
        },
        {
          "text": "Slacks",
          "points": 17,
          "aliases": [
            "pants",
            "slacks"
          ]
        },
        {
          "text": "Heels / formal shoes",
          "points": 14,
          "aliases": [
            "formal shoes",
            "heels",
            "heels / formal shoes"
          ]
        },
        {
          "text": "Necktie",
          "points": 11,
          "aliases": [
            "necktie",
            "tie"
          ]
        },
        {
          "text": "Accessories",
          "points": 9,
          "aliases": [
            "accessories",
            "jewelry"
          ]
        }
      ]
    },
    {
      "id": "formal-event-4",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang common na outfit kapag formal event?",
      "answers": [
        {
          "text": "Dress",
          "points": 28,
          "aliases": [
            "dress",
            "gown"
          ]
        },
        {
          "text": "Polo / long sleeves",
          "points": 21,
          "aliases": [
            "long sleeves",
            "polo",
            "polo / long sleeves"
          ]
        },
        {
          "text": "Slacks",
          "points": 17,
          "aliases": [
            "pants",
            "slacks"
          ]
        },
        {
          "text": "Heels / formal shoes",
          "points": 14,
          "aliases": [
            "formal shoes",
            "heels",
            "heels / formal shoes"
          ]
        },
        {
          "text": "Necktie",
          "points": 11,
          "aliases": [
            "necktie",
            "tie"
          ]
        },
        {
          "text": "Accessories",
          "points": 9,
          "aliases": [
            "accessories",
            "jewelry"
          ]
        }
      ]
    },
    {
      "id": "formal-event-5",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang unang sinusuot ng tao kapag formal event?",
      "answers": [
        {
          "text": "Dress",
          "points": 28,
          "aliases": [
            "dress",
            "gown"
          ]
        },
        {
          "text": "Polo / long sleeves",
          "points": 21,
          "aliases": [
            "long sleeves",
            "polo",
            "polo / long sleeves"
          ]
        },
        {
          "text": "Slacks",
          "points": 17,
          "aliases": [
            "pants",
            "slacks"
          ]
        },
        {
          "text": "Heels / formal shoes",
          "points": 14,
          "aliases": [
            "formal shoes",
            "heels",
            "heels / formal shoes"
          ]
        },
        {
          "text": "Necktie",
          "points": 11,
          "aliases": [
            "necktie",
            "tie"
          ]
        },
        {
          "text": "Accessories",
          "points": 9,
          "aliases": [
            "accessories",
            "jewelry"
          ]
        }
      ]
    },
    {
      "id": "formal-event-6",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang kadalasang parte ng getup kapag formal event?",
      "answers": [
        {
          "text": "Dress",
          "points": 28,
          "aliases": [
            "dress",
            "gown"
          ]
        },
        {
          "text": "Polo / long sleeves",
          "points": 21,
          "aliases": [
            "long sleeves",
            "polo",
            "polo / long sleeves"
          ]
        },
        {
          "text": "Slacks",
          "points": 17,
          "aliases": [
            "pants",
            "slacks"
          ]
        },
        {
          "text": "Heels / formal shoes",
          "points": 14,
          "aliases": [
            "formal shoes",
            "heels",
            "heels / formal shoes"
          ]
        },
        {
          "text": "Necktie",
          "points": 11,
          "aliases": [
            "necktie",
            "tie"
          ]
        },
        {
          "text": "Accessories",
          "points": 9,
          "aliases": [
            "accessories",
            "jewelry"
          ]
        }
      ]
    },
    {
      "id": "formal-event-7",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang madalas kasama sa kasuotan kapag formal event?",
      "answers": [
        {
          "text": "Dress",
          "points": 28,
          "aliases": [
            "dress",
            "gown"
          ]
        },
        {
          "text": "Polo / long sleeves",
          "points": 21,
          "aliases": [
            "long sleeves",
            "polo",
            "polo / long sleeves"
          ]
        },
        {
          "text": "Slacks",
          "points": 17,
          "aliases": [
            "pants",
            "slacks"
          ]
        },
        {
          "text": "Heels / formal shoes",
          "points": 14,
          "aliases": [
            "formal shoes",
            "heels",
            "heels / formal shoes"
          ]
        },
        {
          "text": "Necktie",
          "points": 11,
          "aliases": [
            "necktie",
            "tie"
          ]
        },
        {
          "text": "Accessories",
          "points": 9,
          "aliases": [
            "accessories",
            "jewelry"
          ]
        }
      ]
    },
    {
      "id": "formal-event-8",
      "category": "CELEBRATIONS",
      "prompt": "Ano ang bagay na suot ng marami kapag formal event?",
      "answers": [
        {
          "text": "Dress",
          "points": 28,
          "aliases": [
            "dress",
            "gown"
          ]
        },
        {
          "text": "Polo / long sleeves",
          "points": 21,
          "aliases": [
            "long sleeves",
            "polo",
            "polo / long sleeves"
          ]
        },
        {
          "text": "Slacks",
          "points": 17,
          "aliases": [
            "pants",
            "slacks"
          ]
        },
        {
          "text": "Heels / formal shoes",
          "points": 14,
          "aliases": [
            "formal shoes",
            "heels",
            "heels / formal shoes"
          ]
        },
        {
          "text": "Necktie",
          "points": 11,
          "aliases": [
            "necktie",
            "tie"
          ]
        },
        {
          "text": "Accessories",
          "points": 9,
          "aliases": [
            "accessories",
            "jewelry"
          ]
        }
      ]
    },
    {
      "id": "cold-weather-1",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas isuot ng tao kapag malamig ang panahon?",
      "answers": [
        {
          "text": "Jacket",
          "points": 32,
          "aliases": [
            "coat",
            "jacket"
          ]
        },
        {
          "text": "Sweater",
          "points": 20,
          "aliases": [
            "hoodie",
            "sweater"
          ]
        },
        {
          "text": "Pants",
          "points": 16,
          "aliases": [
            "pants"
          ]
        },
        {
          "text": "Socks",
          "points": 12,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Bonnet / beanie",
          "points": 11,
          "aliases": [
            "beanie",
            "bonnet / beanie",
            "hat"
          ]
        },
        {
          "text": "Closed shoes",
          "points": 9,
          "aliases": [
            "closed shoes",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "cold-weather-2",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Kapag kapag malamig ang panahon, ano ang karaniwang suot?",
      "answers": [
        {
          "text": "Jacket",
          "points": 32,
          "aliases": [
            "coat",
            "jacket"
          ]
        },
        {
          "text": "Sweater",
          "points": 20,
          "aliases": [
            "hoodie",
            "sweater"
          ]
        },
        {
          "text": "Pants",
          "points": 16,
          "aliases": [
            "pants"
          ]
        },
        {
          "text": "Socks",
          "points": 12,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Bonnet / beanie",
          "points": 11,
          "aliases": [
            "beanie",
            "bonnet / beanie",
            "hat"
          ]
        },
        {
          "text": "Closed shoes",
          "points": 9,
          "aliases": [
            "closed shoes",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "cold-weather-3",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Magbanggit ng damit o gamit na sinusuot kapag malamig ang panahon.",
      "answers": [
        {
          "text": "Jacket",
          "points": 32,
          "aliases": [
            "coat",
            "jacket"
          ]
        },
        {
          "text": "Sweater",
          "points": 20,
          "aliases": [
            "hoodie",
            "sweater"
          ]
        },
        {
          "text": "Pants",
          "points": 16,
          "aliases": [
            "pants"
          ]
        },
        {
          "text": "Socks",
          "points": 12,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Bonnet / beanie",
          "points": 11,
          "aliases": [
            "beanie",
            "bonnet / beanie",
            "hat"
          ]
        },
        {
          "text": "Closed shoes",
          "points": 9,
          "aliases": [
            "closed shoes",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "cold-weather-4",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang common na outfit kapag malamig ang panahon?",
      "answers": [
        {
          "text": "Jacket",
          "points": 32,
          "aliases": [
            "coat",
            "jacket"
          ]
        },
        {
          "text": "Sweater",
          "points": 20,
          "aliases": [
            "hoodie",
            "sweater"
          ]
        },
        {
          "text": "Pants",
          "points": 16,
          "aliases": [
            "pants"
          ]
        },
        {
          "text": "Socks",
          "points": 12,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Bonnet / beanie",
          "points": 11,
          "aliases": [
            "beanie",
            "bonnet / beanie",
            "hat"
          ]
        },
        {
          "text": "Closed shoes",
          "points": 9,
          "aliases": [
            "closed shoes",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "cold-weather-5",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang unang sinusuot ng tao kapag malamig ang panahon?",
      "answers": [
        {
          "text": "Jacket",
          "points": 32,
          "aliases": [
            "coat",
            "jacket"
          ]
        },
        {
          "text": "Sweater",
          "points": 20,
          "aliases": [
            "hoodie",
            "sweater"
          ]
        },
        {
          "text": "Pants",
          "points": 16,
          "aliases": [
            "pants"
          ]
        },
        {
          "text": "Socks",
          "points": 12,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Bonnet / beanie",
          "points": 11,
          "aliases": [
            "beanie",
            "bonnet / beanie",
            "hat"
          ]
        },
        {
          "text": "Closed shoes",
          "points": 9,
          "aliases": [
            "closed shoes",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "cold-weather-6",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang kadalasang parte ng getup kapag malamig ang panahon?",
      "answers": [
        {
          "text": "Jacket",
          "points": 32,
          "aliases": [
            "coat",
            "jacket"
          ]
        },
        {
          "text": "Sweater",
          "points": 20,
          "aliases": [
            "hoodie",
            "sweater"
          ]
        },
        {
          "text": "Pants",
          "points": 16,
          "aliases": [
            "pants"
          ]
        },
        {
          "text": "Socks",
          "points": 12,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Bonnet / beanie",
          "points": 11,
          "aliases": [
            "beanie",
            "bonnet / beanie",
            "hat"
          ]
        },
        {
          "text": "Closed shoes",
          "points": 9,
          "aliases": [
            "closed shoes",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "cold-weather-7",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang madalas kasama sa kasuotan kapag malamig ang panahon?",
      "answers": [
        {
          "text": "Jacket",
          "points": 32,
          "aliases": [
            "coat",
            "jacket"
          ]
        },
        {
          "text": "Sweater",
          "points": 20,
          "aliases": [
            "hoodie",
            "sweater"
          ]
        },
        {
          "text": "Pants",
          "points": 16,
          "aliases": [
            "pants"
          ]
        },
        {
          "text": "Socks",
          "points": 12,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Bonnet / beanie",
          "points": 11,
          "aliases": [
            "beanie",
            "bonnet / beanie",
            "hat"
          ]
        },
        {
          "text": "Closed shoes",
          "points": 9,
          "aliases": [
            "closed shoes",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "cold-weather-8",
      "category": "TRAVEL & OUTDOOR",
      "prompt": "Ano ang bagay na suot ng marami kapag malamig ang panahon?",
      "answers": [
        {
          "text": "Jacket",
          "points": 32,
          "aliases": [
            "coat",
            "jacket"
          ]
        },
        {
          "text": "Sweater",
          "points": 20,
          "aliases": [
            "hoodie",
            "sweater"
          ]
        },
        {
          "text": "Pants",
          "points": 16,
          "aliases": [
            "pants"
          ]
        },
        {
          "text": "Socks",
          "points": 12,
          "aliases": [
            "medyas",
            "socks"
          ]
        },
        {
          "text": "Bonnet / beanie",
          "points": 11,
          "aliases": [
            "beanie",
            "bonnet / beanie",
            "hat"
          ]
        },
        {
          "text": "Closed shoes",
          "points": 9,
          "aliases": [
            "closed shoes",
            "shoes"
          ]
        }
      ]
    },
    {
      "id": "sleepwear-1",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas isuot ng tao kapag matutulog?",
      "answers": [
        {
          "text": "Pajama",
          "points": 27,
          "aliases": [
            "pajama",
            "pajamas"
          ]
        },
        {
          "text": "T-shirt",
          "points": 22,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Shorts",
          "points": 18,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "Sando",
          "points": 13,
          "aliases": [
            "sando",
            "tank top"
          ]
        },
        {
          "text": "House dress",
          "points": 11,
          "aliases": [
            "daster",
            "house dress"
          ]
        },
        {
          "text": "Wala nang tsinelas / barefoot",
          "points": 9,
          "aliases": [
            "barefoot",
            "wala nang tsinelas / barefoot"
          ]
        }
      ]
    },
    {
      "id": "sleepwear-2",
      "category": "FAMILY & HOME",
      "prompt": "Kapag kapag matutulog, ano ang karaniwang suot?",
      "answers": [
        {
          "text": "Pajama",
          "points": 27,
          "aliases": [
            "pajama",
            "pajamas"
          ]
        },
        {
          "text": "T-shirt",
          "points": 22,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Shorts",
          "points": 18,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "Sando",
          "points": 13,
          "aliases": [
            "sando",
            "tank top"
          ]
        },
        {
          "text": "House dress",
          "points": 11,
          "aliases": [
            "daster",
            "house dress"
          ]
        },
        {
          "text": "Wala nang tsinelas / barefoot",
          "points": 9,
          "aliases": [
            "barefoot",
            "wala nang tsinelas / barefoot"
          ]
        }
      ]
    },
    {
      "id": "sleepwear-3",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng damit o gamit na sinusuot kapag matutulog.",
      "answers": [
        {
          "text": "Pajama",
          "points": 27,
          "aliases": [
            "pajama",
            "pajamas"
          ]
        },
        {
          "text": "T-shirt",
          "points": 22,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Shorts",
          "points": 18,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "Sando",
          "points": 13,
          "aliases": [
            "sando",
            "tank top"
          ]
        },
        {
          "text": "House dress",
          "points": 11,
          "aliases": [
            "daster",
            "house dress"
          ]
        },
        {
          "text": "Wala nang tsinelas / barefoot",
          "points": 9,
          "aliases": [
            "barefoot",
            "wala nang tsinelas / barefoot"
          ]
        }
      ]
    },
    {
      "id": "sleepwear-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na outfit kapag matutulog?",
      "answers": [
        {
          "text": "Pajama",
          "points": 27,
          "aliases": [
            "pajama",
            "pajamas"
          ]
        },
        {
          "text": "T-shirt",
          "points": 22,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Shorts",
          "points": 18,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "Sando",
          "points": 13,
          "aliases": [
            "sando",
            "tank top"
          ]
        },
        {
          "text": "House dress",
          "points": 11,
          "aliases": [
            "daster",
            "house dress"
          ]
        },
        {
          "text": "Wala nang tsinelas / barefoot",
          "points": 9,
          "aliases": [
            "barefoot",
            "wala nang tsinelas / barefoot"
          ]
        }
      ]
    },
    {
      "id": "sleepwear-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang sinusuot ng tao kapag matutulog?",
      "answers": [
        {
          "text": "Pajama",
          "points": 27,
          "aliases": [
            "pajama",
            "pajamas"
          ]
        },
        {
          "text": "T-shirt",
          "points": 22,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Shorts",
          "points": 18,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "Sando",
          "points": 13,
          "aliases": [
            "sando",
            "tank top"
          ]
        },
        {
          "text": "House dress",
          "points": 11,
          "aliases": [
            "daster",
            "house dress"
          ]
        },
        {
          "text": "Wala nang tsinelas / barefoot",
          "points": 9,
          "aliases": [
            "barefoot",
            "wala nang tsinelas / barefoot"
          ]
        }
      ]
    },
    {
      "id": "sleepwear-6",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang kadalasang parte ng getup kapag matutulog?",
      "answers": [
        {
          "text": "Pajama",
          "points": 27,
          "aliases": [
            "pajama",
            "pajamas"
          ]
        },
        {
          "text": "T-shirt",
          "points": 22,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Shorts",
          "points": 18,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "Sando",
          "points": 13,
          "aliases": [
            "sando",
            "tank top"
          ]
        },
        {
          "text": "House dress",
          "points": 11,
          "aliases": [
            "daster",
            "house dress"
          ]
        },
        {
          "text": "Wala nang tsinelas / barefoot",
          "points": 9,
          "aliases": [
            "barefoot",
            "wala nang tsinelas / barefoot"
          ]
        }
      ]
    },
    {
      "id": "sleepwear-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas kasama sa kasuotan kapag matutulog?",
      "answers": [
        {
          "text": "Pajama",
          "points": 27,
          "aliases": [
            "pajama",
            "pajamas"
          ]
        },
        {
          "text": "T-shirt",
          "points": 22,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Shorts",
          "points": 18,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "Sando",
          "points": 13,
          "aliases": [
            "sando",
            "tank top"
          ]
        },
        {
          "text": "House dress",
          "points": 11,
          "aliases": [
            "daster",
            "house dress"
          ]
        },
        {
          "text": "Wala nang tsinelas / barefoot",
          "points": 9,
          "aliases": [
            "barefoot",
            "wala nang tsinelas / barefoot"
          ]
        }
      ]
    },
    {
      "id": "sleepwear-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang bagay na suot ng marami kapag matutulog?",
      "answers": [
        {
          "text": "Pajama",
          "points": 27,
          "aliases": [
            "pajama",
            "pajamas"
          ]
        },
        {
          "text": "T-shirt",
          "points": 22,
          "aliases": [
            "shirt",
            "t-shirt"
          ]
        },
        {
          "text": "Shorts",
          "points": 18,
          "aliases": [
            "short pants",
            "shorts"
          ]
        },
        {
          "text": "Sando",
          "points": 13,
          "aliases": [
            "sando",
            "tank top"
          ]
        },
        {
          "text": "House dress",
          "points": 11,
          "aliases": [
            "daster",
            "house dress"
          ]
        },
        {
          "text": "Wala nang tsinelas / barefoot",
          "points": 9,
          "aliases": [
            "barefoot",
            "wala nang tsinelas / barefoot"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-1",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang madalas gamitin ng tao kapag online class?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-2",
      "category": "TECH & GADGETS",
      "prompt": "Kapag kapag online class, anong gamit ang mahalaga?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-3",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng tool o gamit na laging ginagamit kapag online class.",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-4",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang common na gamit kapag online class?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-5",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang unang kinukuha ng tao kapag online class?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-6",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang halos hindi puwedeng mawala kapag online class?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-7",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang gamit na madalas hawak kapag online class?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-8",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang essential na gamit kapag online class?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-9",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang bagay na kadalasang kailangan kapag online class?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "online-class-tools-10",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang kagamitan na inaasahang nandiyan kapag online class?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Laptop / computer",
          "points": 21,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Internet / Wi-Fi",
          "points": 16,
          "aliases": [
            "internet",
            "internet / wi-fi",
            "wifi"
          ]
        },
        {
          "text": "Earphones",
          "points": 13,
          "aliases": [
            "earphones",
            "headset"
          ]
        },
        {
          "text": "Notebook / notes",
          "points": 12,
          "aliases": [
            "notebook",
            "notebook / notes",
            "notes"
          ]
        },
        {
          "text": "Charger",
          "points": 9,
          "aliases": [
            "charger"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-1",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang madalas gamitin ng tao kapag nagco-code sa computer?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-2",
      "category": "TECH & GADGETS",
      "prompt": "Kapag kapag nagco-code sa computer, anong gamit ang mahalaga?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-3",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng tool o gamit na laging ginagamit kapag nagco-code sa computer.",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-4",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang common na gamit kapag nagco-code sa computer?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-5",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang unang kinukuha ng tao kapag nagco-code sa computer?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-6",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang halos hindi puwedeng mawala kapag nagco-code sa computer?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-7",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang gamit na madalas hawak kapag nagco-code sa computer?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-8",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang essential na gamit kapag nagco-code sa computer?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-9",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang bagay na kadalasang kailangan kapag nagco-code sa computer?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "coding-tools-10",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang kagamitan na inaasahang nandiyan kapag nagco-code sa computer?",
      "answers": [
        {
          "text": "Laptop / computer",
          "points": 26,
          "aliases": [
            "computer",
            "laptop",
            "laptop / computer"
          ]
        },
        {
          "text": "Keyboard",
          "points": 22,
          "aliases": [
            "keyboard"
          ]
        },
        {
          "text": "Mouse",
          "points": 18,
          "aliases": [
            "mouse"
          ]
        },
        {
          "text": "Internet",
          "points": 14,
          "aliases": [
            "internet",
            "wifi"
          ]
        },
        {
          "text": "Code editor / browser",
          "points": 12,
          "aliases": [
            "browser",
            "code editor / browser",
            "editor"
          ]
        },
        {
          "text": "Headphones",
          "points": 8,
          "aliases": [
            "headphones",
            "headset"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-1",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas gamitin ng tao kapag naglilinis ng bahay?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-2",
      "category": "FAMILY & HOME",
      "prompt": "Kapag kapag naglilinis ng bahay, anong gamit ang mahalaga?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-3",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng tool o gamit na laging ginagamit kapag naglilinis ng bahay.",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na gamit kapag naglilinis ng bahay?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang kinukuha ng tao kapag naglilinis ng bahay?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-6",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang halos hindi puwedeng mawala kapag naglilinis ng bahay?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang gamit na madalas hawak kapag naglilinis ng bahay?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang essential na gamit kapag naglilinis ng bahay?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang bagay na kadalasang kailangan kapag naglilinis ng bahay?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "house-cleaning-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang kagamitan na inaasahang nandiyan kapag naglilinis ng bahay?",
      "answers": [
        {
          "text": "Walis",
          "points": 30,
          "aliases": [
            "broom",
            "walis"
          ]
        },
        {
          "text": "Basahan",
          "points": 22,
          "aliases": [
            "basahan",
            "rag"
          ]
        },
        {
          "text": "Dustpan",
          "points": 17,
          "aliases": [
            "dust pan",
            "dustpan"
          ]
        },
        {
          "text": "Mop",
          "points": 13,
          "aliases": [
            "mop"
          ]
        },
        {
          "text": "Timba",
          "points": 10,
          "aliases": [
            "bucket",
            "timba"
          ]
        },
        {
          "text": "Sabon / cleaner",
          "points": 8,
          "aliases": [
            "cleaner",
            "sabon / cleaner",
            "soap"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-1",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang madalas gamitin ng tao kapag nagluluto?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-2",
      "category": "FOOD & DRINK",
      "prompt": "Kapag kapag nagluluto, anong gamit ang mahalaga?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-3",
      "category": "FOOD & DRINK",
      "prompt": "Magbanggit ng tool o gamit na laging ginagamit kapag nagluluto.",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-4",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang common na gamit kapag nagluluto?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-5",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang unang kinukuha ng tao kapag nagluluto?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-6",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang halos hindi puwedeng mawala kapag nagluluto?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-7",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang gamit na madalas hawak kapag nagluluto?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-8",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang essential na gamit kapag nagluluto?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-9",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang bagay na kadalasang kailangan kapag nagluluto?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "cooking-tools-10",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang kagamitan na inaasahang nandiyan kapag nagluluto?",
      "answers": [
        {
          "text": "Kawali / kaldero",
          "points": 28,
          "aliases": [
            "kawali / kaldero",
            "pan",
            "pot"
          ]
        },
        {
          "text": "Kutsilyo",
          "points": 21,
          "aliases": [
            "knife",
            "kutsilyo"
          ]
        },
        {
          "text": "Sandok / spatula",
          "points": 17,
          "aliases": [
            "sandok",
            "sandok / spatula",
            "spatula"
          ]
        },
        {
          "text": "Chopping board",
          "points": 14,
          "aliases": [
            "board",
            "chopping board"
          ]
        },
        {
          "text": "Kutsara at tinidor",
          "points": 11,
          "aliases": [
            "fork",
            "kutsara at tinidor",
            "spoon"
          ]
        },
        {
          "text": "Stove / kalan",
          "points": 9,
          "aliases": [
            "kalan",
            "stove",
            "stove / kalan"
          ]
        }
      ]
    },
    {
      "id": "school-project-1",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang madalas gamitin ng tao kapag may school project?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-2",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag kapag may school project, anong gamit ang mahalaga?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-3",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng tool o gamit na laging ginagamit kapag may school project.",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na gamit kapag may school project?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-5",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang unang kinukuha ng tao kapag may school project?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-6",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang halos hindi puwedeng mawala kapag may school project?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang gamit na madalas hawak kapag may school project?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang essential na gamit kapag may school project?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-9",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang bagay na kadalasang kailangan kapag may school project?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "school-project-10",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang kagamitan na inaasahang nandiyan kapag may school project?",
      "answers": [
        {
          "text": "Cartolina",
          "points": 32,
          "aliases": [
            "cartolina",
            "poster board"
          ]
        },
        {
          "text": "Bond paper",
          "points": 20,
          "aliases": [
            "bond paper",
            "paper"
          ]
        },
        {
          "text": "Glue",
          "points": 16,
          "aliases": [
            "glue"
          ]
        },
        {
          "text": "Scissors",
          "points": 12,
          "aliases": [
            "gunting",
            "scissors"
          ]
        },
        {
          "text": "Markers",
          "points": 11,
          "aliases": [
            "marker",
            "markers",
            "pentel pen"
          ]
        },
        {
          "text": "Tape",
          "points": 9,
          "aliases": [
            "scotch tape",
            "tape"
          ]
        }
      ]
    },
    {
      "id": "gardening-1",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang madalas gamitin ng tao kapag nagga-garden?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-2",
      "category": "FAMILY & HOME",
      "prompt": "Kapag kapag nagga-garden, anong gamit ang mahalaga?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-3",
      "category": "FAMILY & HOME",
      "prompt": "Magbanggit ng tool o gamit na laging ginagamit kapag nagga-garden.",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-4",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang common na gamit kapag nagga-garden?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-5",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang unang kinukuha ng tao kapag nagga-garden?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-6",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang halos hindi puwedeng mawala kapag nagga-garden?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-7",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang gamit na madalas hawak kapag nagga-garden?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-8",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang essential na gamit kapag nagga-garden?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-9",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang bagay na kadalasang kailangan kapag nagga-garden?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "gardening-10",
      "category": "FAMILY & HOME",
      "prompt": "Ano ang kagamitan na inaasahang nandiyan kapag nagga-garden?",
      "answers": [
        {
          "text": "Pala",
          "points": 27,
          "aliases": [
            "pala",
            "shovel"
          ]
        },
        {
          "text": "Watering can",
          "points": 22,
          "aliases": [
            "pandilig",
            "watering can"
          ]
        },
        {
          "text": "Paso",
          "points": 18,
          "aliases": [
            "paso",
            "pot"
          ]
        },
        {
          "text": "Soil / lupa",
          "points": 13,
          "aliases": [
            "lupa",
            "soil",
            "soil / lupa"
          ]
        },
        {
          "text": "Seeds / halaman",
          "points": 11,
          "aliases": [
            "plants",
            "seeds",
            "seeds / halaman"
          ]
        },
        {
          "text": "Gloves",
          "points": 9,
          "aliases": [
            "gloves"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-1",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang madalas gamitin ng tao kapag kukuha ng picture?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-2",
      "category": "TECH & GADGETS",
      "prompt": "Kapag kapag kukuha ng picture, anong gamit ang mahalaga?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-3",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng tool o gamit na laging ginagamit kapag kukuha ng picture.",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-4",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang common na gamit kapag kukuha ng picture?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-5",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang unang kinukuha ng tao kapag kukuha ng picture?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-6",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang halos hindi puwedeng mawala kapag kukuha ng picture?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-7",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang gamit na madalas hawak kapag kukuha ng picture?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-8",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang essential na gamit kapag kukuha ng picture?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-9",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang bagay na kadalasang kailangan kapag kukuha ng picture?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "taking-photos-10",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang kagamitan na inaasahang nandiyan kapag kukuha ng picture?",
      "answers": [
        {
          "text": "Cellphone",
          "points": 29,
          "aliases": [
            "cellphone",
            "phone"
          ]
        },
        {
          "text": "Camera",
          "points": 21,
          "aliases": [
            "camera"
          ]
        },
        {
          "text": "Tripod",
          "points": 16,
          "aliases": [
            "tripod"
          ]
        },
        {
          "text": "Ring light / ilaw",
          "points": 13,
          "aliases": [
            "light",
            "ring light",
            "ring light / ilaw"
          ]
        },
        {
          "text": "Selfie stick",
          "points": 12,
          "aliases": [
            "selfie stick"
          ]
        },
        {
          "text": "Power bank",
          "points": 9,
          "aliases": [
            "charger pack",
            "power bank"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-1",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang madalas gamitin ng tao kapag nag-eehersisyo?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-2",
      "category": "HEALTH & WELLNESS",
      "prompt": "Kapag kapag nag-eehersisyo, anong gamit ang mahalaga?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-3",
      "category": "HEALTH & WELLNESS",
      "prompt": "Magbanggit ng tool o gamit na laging ginagamit kapag nag-eehersisyo.",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-4",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang common na gamit kapag nag-eehersisyo?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-5",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang unang kinukuha ng tao kapag nag-eehersisyo?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-6",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang halos hindi puwedeng mawala kapag nag-eehersisyo?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-7",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang gamit na madalas hawak kapag nag-eehersisyo?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-8",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang essential na gamit kapag nag-eehersisyo?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-9",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang bagay na kadalasang kailangan kapag nag-eehersisyo?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "exercise-tools-10",
      "category": "HEALTH & WELLNESS",
      "prompt": "Ano ang kagamitan na inaasahang nandiyan kapag nag-eehersisyo?",
      "answers": [
        {
          "text": "Rubber shoes",
          "points": 26,
          "aliases": [
            "rubber shoes",
            "shoes"
          ]
        },
        {
          "text": "Tubig",
          "points": 22,
          "aliases": [
            "tubig",
            "water"
          ]
        },
        {
          "text": "Towel",
          "points": 18,
          "aliases": [
            "towel"
          ]
        },
        {
          "text": "Yoga mat",
          "points": 14,
          "aliases": [
            "mat",
            "yoga mat"
          ]
        },
        {
          "text": "Weights / dumbbell",
          "points": 12,
          "aliases": [
            "dumbbell",
            "weights",
            "weights / dumbbell"
          ]
        },
        {
          "text": "Timer / watch",
          "points": 8,
          "aliases": [
            "timer",
            "timer / watch",
            "watch"
          ]
        }
      ]
    },
    {
      "id": "late-at-school-1",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang karaniwang dahilan kung bakit nalalate ang estudyante sa school?",
      "answers": [
        {
          "text": "Na-traffic",
          "points": 30,
          "aliases": [
            "na-traffic",
            "traffic"
          ]
        },
        {
          "text": "Late nagising",
          "points": 22,
          "aliases": [
            "late gumising",
            "late nagising",
            "overslept"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 17,
          "aliases": [
            "mabagal maghanda",
            "slow to get ready"
          ]
        },
        {
          "text": "Walang masakyan",
          "points": 13,
          "aliases": [
            "commute issue",
            "no ride",
            "walang masakyan"
          ]
        },
        {
          "text": "Masamang panahon",
          "points": 10,
          "aliases": [
            "masamang panahon",
            "rain",
            "ulan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "late-at-school-2",
      "category": "SCHOOL LIFE",
      "prompt": "Bakit madalas na bakit nalalate ang estudyante sa school?",
      "answers": [
        {
          "text": "Na-traffic",
          "points": 30,
          "aliases": [
            "na-traffic",
            "traffic"
          ]
        },
        {
          "text": "Late nagising",
          "points": 22,
          "aliases": [
            "late gumising",
            "late nagising",
            "overslept"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 17,
          "aliases": [
            "mabagal maghanda",
            "slow to get ready"
          ]
        },
        {
          "text": "Walang masakyan",
          "points": 13,
          "aliases": [
            "commute issue",
            "no ride",
            "walang masakyan"
          ]
        },
        {
          "text": "Masamang panahon",
          "points": 10,
          "aliases": [
            "masamang panahon",
            "rain",
            "ulan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "late-at-school-3",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng dahilan kung bakit nalalate ang estudyante sa school.",
      "answers": [
        {
          "text": "Na-traffic",
          "points": 30,
          "aliases": [
            "na-traffic",
            "traffic"
          ]
        },
        {
          "text": "Late nagising",
          "points": 22,
          "aliases": [
            "late gumising",
            "late nagising",
            "overslept"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 17,
          "aliases": [
            "mabagal maghanda",
            "slow to get ready"
          ]
        },
        {
          "text": "Walang masakyan",
          "points": 13,
          "aliases": [
            "commute issue",
            "no ride",
            "walang masakyan"
          ]
        },
        {
          "text": "Masamang panahon",
          "points": 10,
          "aliases": [
            "masamang panahon",
            "rain",
            "ulan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "late-at-school-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang isa sa pinaka-common na rason kung bakit nalalate ang estudyante sa school?",
      "answers": [
        {
          "text": "Na-traffic",
          "points": 30,
          "aliases": [
            "na-traffic",
            "traffic"
          ]
        },
        {
          "text": "Late nagising",
          "points": 22,
          "aliases": [
            "late gumising",
            "late nagising",
            "overslept"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 17,
          "aliases": [
            "mabagal maghanda",
            "slow to get ready"
          ]
        },
        {
          "text": "Walang masakyan",
          "points": 13,
          "aliases": [
            "commute issue",
            "no ride",
            "walang masakyan"
          ]
        },
        {
          "text": "Masamang panahon",
          "points": 10,
          "aliases": [
            "masamang panahon",
            "rain",
            "ulan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "late-at-school-5",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag bakit nalalate ang estudyante sa school, ano ang kadalasang paliwanag?",
      "answers": [
        {
          "text": "Na-traffic",
          "points": 30,
          "aliases": [
            "na-traffic",
            "traffic"
          ]
        },
        {
          "text": "Late nagising",
          "points": 22,
          "aliases": [
            "late gumising",
            "late nagising",
            "overslept"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 17,
          "aliases": [
            "mabagal maghanda",
            "slow to get ready"
          ]
        },
        {
          "text": "Walang masakyan",
          "points": 13,
          "aliases": [
            "commute issue",
            "no ride",
            "walang masakyan"
          ]
        },
        {
          "text": "Masamang panahon",
          "points": 10,
          "aliases": [
            "masamang panahon",
            "rain",
            "ulan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "late-at-school-6",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang dahilan na madalas sabihin ng tao kung bakit nalalate ang estudyante sa school?",
      "answers": [
        {
          "text": "Na-traffic",
          "points": 30,
          "aliases": [
            "na-traffic",
            "traffic"
          ]
        },
        {
          "text": "Late nagising",
          "points": 22,
          "aliases": [
            "late gumising",
            "late nagising",
            "overslept"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 17,
          "aliases": [
            "mabagal maghanda",
            "slow to get ready"
          ]
        },
        {
          "text": "Walang masakyan",
          "points": 13,
          "aliases": [
            "commute issue",
            "no ride",
            "walang masakyan"
          ]
        },
        {
          "text": "Masamang panahon",
          "points": 10,
          "aliases": [
            "masamang panahon",
            "rain",
            "ulan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "late-at-school-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang posibleng sanhi kung bakit nalalate ang estudyante sa school?",
      "answers": [
        {
          "text": "Na-traffic",
          "points": 30,
          "aliases": [
            "na-traffic",
            "traffic"
          ]
        },
        {
          "text": "Late nagising",
          "points": 22,
          "aliases": [
            "late gumising",
            "late nagising",
            "overslept"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 17,
          "aliases": [
            "mabagal maghanda",
            "slow to get ready"
          ]
        },
        {
          "text": "Walang masakyan",
          "points": 13,
          "aliases": [
            "commute issue",
            "no ride",
            "walang masakyan"
          ]
        },
        {
          "text": "Masamang panahon",
          "points": 10,
          "aliases": [
            "masamang panahon",
            "rain",
            "ulan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "late-at-school-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na rason kung bakit nalalate ang estudyante sa school?",
      "answers": [
        {
          "text": "Na-traffic",
          "points": 30,
          "aliases": [
            "na-traffic",
            "traffic"
          ]
        },
        {
          "text": "Late nagising",
          "points": 22,
          "aliases": [
            "late gumising",
            "late nagising",
            "overslept"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 17,
          "aliases": [
            "mabagal maghanda",
            "slow to get ready"
          ]
        },
        {
          "text": "Walang masakyan",
          "points": 13,
          "aliases": [
            "commute issue",
            "no ride",
            "walang masakyan"
          ]
        },
        {
          "text": "Masamang panahon",
          "points": 10,
          "aliases": [
            "masamang panahon",
            "rain",
            "ulan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "phone-low-battery-1",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang karaniwang dahilan kung bakit mabilis malowbat ang cellphone?",
      "answers": [
        {
          "text": "Palaging ginagamit",
          "points": 28,
          "aliases": [
            "heavy use",
            "lagi gamit",
            "palaging ginagamit"
          ]
        },
        {
          "text": "Mataas ang brightness",
          "points": 21,
          "aliases": [
            "brightness",
            "mataas ang brightness"
          ]
        },
        {
          "text": "Maraming apps bukas",
          "points": 17,
          "aliases": [
            "apps",
            "many apps",
            "maraming apps bukas"
          ]
        },
        {
          "text": "Mahina na ang battery",
          "points": 14,
          "aliases": [
            "mahina na ang battery",
            "old battery",
            "sira battery"
          ]
        },
        {
          "text": "Mahina ang signal",
          "points": 11,
          "aliases": [
            "mahina ang signal",
            "signal"
          ]
        },
        {
          "text": "Naglalaro / nanonood",
          "points": 9,
          "aliases": [
            "gaming",
            "naglalaro / nanonood",
            "videos"
          ]
        }
      ]
    },
    {
      "id": "phone-low-battery-2",
      "category": "TECH & GADGETS",
      "prompt": "Bakit madalas na bakit mabilis malowbat ang cellphone?",
      "answers": [
        {
          "text": "Palaging ginagamit",
          "points": 28,
          "aliases": [
            "heavy use",
            "lagi gamit",
            "palaging ginagamit"
          ]
        },
        {
          "text": "Mataas ang brightness",
          "points": 21,
          "aliases": [
            "brightness",
            "mataas ang brightness"
          ]
        },
        {
          "text": "Maraming apps bukas",
          "points": 17,
          "aliases": [
            "apps",
            "many apps",
            "maraming apps bukas"
          ]
        },
        {
          "text": "Mahina na ang battery",
          "points": 14,
          "aliases": [
            "mahina na ang battery",
            "old battery",
            "sira battery"
          ]
        },
        {
          "text": "Mahina ang signal",
          "points": 11,
          "aliases": [
            "mahina ang signal",
            "signal"
          ]
        },
        {
          "text": "Naglalaro / nanonood",
          "points": 9,
          "aliases": [
            "gaming",
            "naglalaro / nanonood",
            "videos"
          ]
        }
      ]
    },
    {
      "id": "phone-low-battery-3",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng dahilan kung bakit mabilis malowbat ang cellphone.",
      "answers": [
        {
          "text": "Palaging ginagamit",
          "points": 28,
          "aliases": [
            "heavy use",
            "lagi gamit",
            "palaging ginagamit"
          ]
        },
        {
          "text": "Mataas ang brightness",
          "points": 21,
          "aliases": [
            "brightness",
            "mataas ang brightness"
          ]
        },
        {
          "text": "Maraming apps bukas",
          "points": 17,
          "aliases": [
            "apps",
            "many apps",
            "maraming apps bukas"
          ]
        },
        {
          "text": "Mahina na ang battery",
          "points": 14,
          "aliases": [
            "mahina na ang battery",
            "old battery",
            "sira battery"
          ]
        },
        {
          "text": "Mahina ang signal",
          "points": 11,
          "aliases": [
            "mahina ang signal",
            "signal"
          ]
        },
        {
          "text": "Naglalaro / nanonood",
          "points": 9,
          "aliases": [
            "gaming",
            "naglalaro / nanonood",
            "videos"
          ]
        }
      ]
    },
    {
      "id": "phone-low-battery-4",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang isa sa pinaka-common na rason kung bakit mabilis malowbat ang cellphone?",
      "answers": [
        {
          "text": "Palaging ginagamit",
          "points": 28,
          "aliases": [
            "heavy use",
            "lagi gamit",
            "palaging ginagamit"
          ]
        },
        {
          "text": "Mataas ang brightness",
          "points": 21,
          "aliases": [
            "brightness",
            "mataas ang brightness"
          ]
        },
        {
          "text": "Maraming apps bukas",
          "points": 17,
          "aliases": [
            "apps",
            "many apps",
            "maraming apps bukas"
          ]
        },
        {
          "text": "Mahina na ang battery",
          "points": 14,
          "aliases": [
            "mahina na ang battery",
            "old battery",
            "sira battery"
          ]
        },
        {
          "text": "Mahina ang signal",
          "points": 11,
          "aliases": [
            "mahina ang signal",
            "signal"
          ]
        },
        {
          "text": "Naglalaro / nanonood",
          "points": 9,
          "aliases": [
            "gaming",
            "naglalaro / nanonood",
            "videos"
          ]
        }
      ]
    },
    {
      "id": "phone-low-battery-5",
      "category": "TECH & GADGETS",
      "prompt": "Kapag bakit mabilis malowbat ang cellphone, ano ang kadalasang paliwanag?",
      "answers": [
        {
          "text": "Palaging ginagamit",
          "points": 28,
          "aliases": [
            "heavy use",
            "lagi gamit",
            "palaging ginagamit"
          ]
        },
        {
          "text": "Mataas ang brightness",
          "points": 21,
          "aliases": [
            "brightness",
            "mataas ang brightness"
          ]
        },
        {
          "text": "Maraming apps bukas",
          "points": 17,
          "aliases": [
            "apps",
            "many apps",
            "maraming apps bukas"
          ]
        },
        {
          "text": "Mahina na ang battery",
          "points": 14,
          "aliases": [
            "mahina na ang battery",
            "old battery",
            "sira battery"
          ]
        },
        {
          "text": "Mahina ang signal",
          "points": 11,
          "aliases": [
            "mahina ang signal",
            "signal"
          ]
        },
        {
          "text": "Naglalaro / nanonood",
          "points": 9,
          "aliases": [
            "gaming",
            "naglalaro / nanonood",
            "videos"
          ]
        }
      ]
    },
    {
      "id": "phone-low-battery-6",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang dahilan na madalas sabihin ng tao kung bakit mabilis malowbat ang cellphone?",
      "answers": [
        {
          "text": "Palaging ginagamit",
          "points": 28,
          "aliases": [
            "heavy use",
            "lagi gamit",
            "palaging ginagamit"
          ]
        },
        {
          "text": "Mataas ang brightness",
          "points": 21,
          "aliases": [
            "brightness",
            "mataas ang brightness"
          ]
        },
        {
          "text": "Maraming apps bukas",
          "points": 17,
          "aliases": [
            "apps",
            "many apps",
            "maraming apps bukas"
          ]
        },
        {
          "text": "Mahina na ang battery",
          "points": 14,
          "aliases": [
            "mahina na ang battery",
            "old battery",
            "sira battery"
          ]
        },
        {
          "text": "Mahina ang signal",
          "points": 11,
          "aliases": [
            "mahina ang signal",
            "signal"
          ]
        },
        {
          "text": "Naglalaro / nanonood",
          "points": 9,
          "aliases": [
            "gaming",
            "naglalaro / nanonood",
            "videos"
          ]
        }
      ]
    },
    {
      "id": "phone-low-battery-7",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang posibleng sanhi kung bakit mabilis malowbat ang cellphone?",
      "answers": [
        {
          "text": "Palaging ginagamit",
          "points": 28,
          "aliases": [
            "heavy use",
            "lagi gamit",
            "palaging ginagamit"
          ]
        },
        {
          "text": "Mataas ang brightness",
          "points": 21,
          "aliases": [
            "brightness",
            "mataas ang brightness"
          ]
        },
        {
          "text": "Maraming apps bukas",
          "points": 17,
          "aliases": [
            "apps",
            "many apps",
            "maraming apps bukas"
          ]
        },
        {
          "text": "Mahina na ang battery",
          "points": 14,
          "aliases": [
            "mahina na ang battery",
            "old battery",
            "sira battery"
          ]
        },
        {
          "text": "Mahina ang signal",
          "points": 11,
          "aliases": [
            "mahina ang signal",
            "signal"
          ]
        },
        {
          "text": "Naglalaro / nanonood",
          "points": 9,
          "aliases": [
            "gaming",
            "naglalaro / nanonood",
            "videos"
          ]
        }
      ]
    },
    {
      "id": "phone-low-battery-8",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang common na rason kung bakit mabilis malowbat ang cellphone?",
      "answers": [
        {
          "text": "Palaging ginagamit",
          "points": 28,
          "aliases": [
            "heavy use",
            "lagi gamit",
            "palaging ginagamit"
          ]
        },
        {
          "text": "Mataas ang brightness",
          "points": 21,
          "aliases": [
            "brightness",
            "mataas ang brightness"
          ]
        },
        {
          "text": "Maraming apps bukas",
          "points": 17,
          "aliases": [
            "apps",
            "many apps",
            "maraming apps bukas"
          ]
        },
        {
          "text": "Mahina na ang battery",
          "points": 14,
          "aliases": [
            "mahina na ang battery",
            "old battery",
            "sira battery"
          ]
        },
        {
          "text": "Mahina ang signal",
          "points": 11,
          "aliases": [
            "mahina ang signal",
            "signal"
          ]
        },
        {
          "text": "Naglalaro / nanonood",
          "points": 9,
          "aliases": [
            "gaming",
            "naglalaro / nanonood",
            "videos"
          ]
        }
      ]
    },
    {
      "id": "study-at-night-1",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang karaniwang dahilan kung bakit sa gabi nagre-review ang estudyante?",
      "answers": [
        {
          "text": "Tahimik",
          "points": 32,
          "aliases": [
            "quiet",
            "tahimik"
          ]
        },
        {
          "text": "May free time",
          "points": 20,
          "aliases": [
            "free time",
            "may free time"
          ]
        },
        {
          "text": "Galing school sa umaga",
          "points": 16,
          "aliases": [
            "busy daytime",
            "galing school sa umaga"
          ]
        },
        {
          "text": "Mas nakakafocus",
          "points": 12,
          "aliases": [
            "focus",
            "mas nakakafocus"
          ]
        },
        {
          "text": "Deadline / exam bukas",
          "points": 11,
          "aliases": [
            "deadline",
            "deadline / exam bukas",
            "exam tomorrow"
          ]
        },
        {
          "text": "May internet sa gabi",
          "points": 9,
          "aliases": [
            "internet",
            "may internet sa gabi"
          ]
        }
      ]
    },
    {
      "id": "study-at-night-2",
      "category": "SCHOOL LIFE",
      "prompt": "Bakit madalas na bakit sa gabi nagre-review ang estudyante?",
      "answers": [
        {
          "text": "Tahimik",
          "points": 32,
          "aliases": [
            "quiet",
            "tahimik"
          ]
        },
        {
          "text": "May free time",
          "points": 20,
          "aliases": [
            "free time",
            "may free time"
          ]
        },
        {
          "text": "Galing school sa umaga",
          "points": 16,
          "aliases": [
            "busy daytime",
            "galing school sa umaga"
          ]
        },
        {
          "text": "Mas nakakafocus",
          "points": 12,
          "aliases": [
            "focus",
            "mas nakakafocus"
          ]
        },
        {
          "text": "Deadline / exam bukas",
          "points": 11,
          "aliases": [
            "deadline",
            "deadline / exam bukas",
            "exam tomorrow"
          ]
        },
        {
          "text": "May internet sa gabi",
          "points": 9,
          "aliases": [
            "internet",
            "may internet sa gabi"
          ]
        }
      ]
    },
    {
      "id": "study-at-night-3",
      "category": "SCHOOL LIFE",
      "prompt": "Magbanggit ng dahilan kung bakit sa gabi nagre-review ang estudyante.",
      "answers": [
        {
          "text": "Tahimik",
          "points": 32,
          "aliases": [
            "quiet",
            "tahimik"
          ]
        },
        {
          "text": "May free time",
          "points": 20,
          "aliases": [
            "free time",
            "may free time"
          ]
        },
        {
          "text": "Galing school sa umaga",
          "points": 16,
          "aliases": [
            "busy daytime",
            "galing school sa umaga"
          ]
        },
        {
          "text": "Mas nakakafocus",
          "points": 12,
          "aliases": [
            "focus",
            "mas nakakafocus"
          ]
        },
        {
          "text": "Deadline / exam bukas",
          "points": 11,
          "aliases": [
            "deadline",
            "deadline / exam bukas",
            "exam tomorrow"
          ]
        },
        {
          "text": "May internet sa gabi",
          "points": 9,
          "aliases": [
            "internet",
            "may internet sa gabi"
          ]
        }
      ]
    },
    {
      "id": "study-at-night-4",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang isa sa pinaka-common na rason kung bakit sa gabi nagre-review ang estudyante?",
      "answers": [
        {
          "text": "Tahimik",
          "points": 32,
          "aliases": [
            "quiet",
            "tahimik"
          ]
        },
        {
          "text": "May free time",
          "points": 20,
          "aliases": [
            "free time",
            "may free time"
          ]
        },
        {
          "text": "Galing school sa umaga",
          "points": 16,
          "aliases": [
            "busy daytime",
            "galing school sa umaga"
          ]
        },
        {
          "text": "Mas nakakafocus",
          "points": 12,
          "aliases": [
            "focus",
            "mas nakakafocus"
          ]
        },
        {
          "text": "Deadline / exam bukas",
          "points": 11,
          "aliases": [
            "deadline",
            "deadline / exam bukas",
            "exam tomorrow"
          ]
        },
        {
          "text": "May internet sa gabi",
          "points": 9,
          "aliases": [
            "internet",
            "may internet sa gabi"
          ]
        }
      ]
    },
    {
      "id": "study-at-night-5",
      "category": "SCHOOL LIFE",
      "prompt": "Kapag bakit sa gabi nagre-review ang estudyante, ano ang kadalasang paliwanag?",
      "answers": [
        {
          "text": "Tahimik",
          "points": 32,
          "aliases": [
            "quiet",
            "tahimik"
          ]
        },
        {
          "text": "May free time",
          "points": 20,
          "aliases": [
            "free time",
            "may free time"
          ]
        },
        {
          "text": "Galing school sa umaga",
          "points": 16,
          "aliases": [
            "busy daytime",
            "galing school sa umaga"
          ]
        },
        {
          "text": "Mas nakakafocus",
          "points": 12,
          "aliases": [
            "focus",
            "mas nakakafocus"
          ]
        },
        {
          "text": "Deadline / exam bukas",
          "points": 11,
          "aliases": [
            "deadline",
            "deadline / exam bukas",
            "exam tomorrow"
          ]
        },
        {
          "text": "May internet sa gabi",
          "points": 9,
          "aliases": [
            "internet",
            "may internet sa gabi"
          ]
        }
      ]
    },
    {
      "id": "study-at-night-6",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang dahilan na madalas sabihin ng tao kung bakit sa gabi nagre-review ang estudyante?",
      "answers": [
        {
          "text": "Tahimik",
          "points": 32,
          "aliases": [
            "quiet",
            "tahimik"
          ]
        },
        {
          "text": "May free time",
          "points": 20,
          "aliases": [
            "free time",
            "may free time"
          ]
        },
        {
          "text": "Galing school sa umaga",
          "points": 16,
          "aliases": [
            "busy daytime",
            "galing school sa umaga"
          ]
        },
        {
          "text": "Mas nakakafocus",
          "points": 12,
          "aliases": [
            "focus",
            "mas nakakafocus"
          ]
        },
        {
          "text": "Deadline / exam bukas",
          "points": 11,
          "aliases": [
            "deadline",
            "deadline / exam bukas",
            "exam tomorrow"
          ]
        },
        {
          "text": "May internet sa gabi",
          "points": 9,
          "aliases": [
            "internet",
            "may internet sa gabi"
          ]
        }
      ]
    },
    {
      "id": "study-at-night-7",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang posibleng sanhi kung bakit sa gabi nagre-review ang estudyante?",
      "answers": [
        {
          "text": "Tahimik",
          "points": 32,
          "aliases": [
            "quiet",
            "tahimik"
          ]
        },
        {
          "text": "May free time",
          "points": 20,
          "aliases": [
            "free time",
            "may free time"
          ]
        },
        {
          "text": "Galing school sa umaga",
          "points": 16,
          "aliases": [
            "busy daytime",
            "galing school sa umaga"
          ]
        },
        {
          "text": "Mas nakakafocus",
          "points": 12,
          "aliases": [
            "focus",
            "mas nakakafocus"
          ]
        },
        {
          "text": "Deadline / exam bukas",
          "points": 11,
          "aliases": [
            "deadline",
            "deadline / exam bukas",
            "exam tomorrow"
          ]
        },
        {
          "text": "May internet sa gabi",
          "points": 9,
          "aliases": [
            "internet",
            "may internet sa gabi"
          ]
        }
      ]
    },
    {
      "id": "study-at-night-8",
      "category": "SCHOOL LIFE",
      "prompt": "Ano ang common na rason kung bakit sa gabi nagre-review ang estudyante?",
      "answers": [
        {
          "text": "Tahimik",
          "points": 32,
          "aliases": [
            "quiet",
            "tahimik"
          ]
        },
        {
          "text": "May free time",
          "points": 20,
          "aliases": [
            "free time",
            "may free time"
          ]
        },
        {
          "text": "Galing school sa umaga",
          "points": 16,
          "aliases": [
            "busy daytime",
            "galing school sa umaga"
          ]
        },
        {
          "text": "Mas nakakafocus",
          "points": 12,
          "aliases": [
            "focus",
            "mas nakakafocus"
          ]
        },
        {
          "text": "Deadline / exam bukas",
          "points": 11,
          "aliases": [
            "deadline",
            "deadline / exam bukas",
            "exam tomorrow"
          ]
        },
        {
          "text": "May internet sa gabi",
          "points": 9,
          "aliases": [
            "internet",
            "may internet sa gabi"
          ]
        }
      ]
    },
    {
      "id": "save-money-1",
      "category": "WORK & MONEY",
      "prompt": "Ano ang karaniwang dahilan kung bakit nag-iipon ng pera ang tao?",
      "answers": [
        {
          "text": "Emergency",
          "points": 27,
          "aliases": [
            "emergency",
            "emergency fund"
          ]
        },
        {
          "text": "Pangarap / goals",
          "points": 22,
          "aliases": [
            "dream",
            "goals",
            "pangarap / goals"
          ]
        },
        {
          "text": "Pambili ng gusto",
          "points": 18,
          "aliases": [
            "buy something",
            "pambili ng gusto",
            "wants"
          ]
        },
        {
          "text": "Pang-aral",
          "points": 13,
          "aliases": [
            "pang-aral",
            "school expenses",
            "tuition"
          ]
        },
        {
          "text": "Pamilya / future",
          "points": 11,
          "aliases": [
            "family",
            "future",
            "pamilya / future"
          ]
        },
        {
          "text": "Pang-travel",
          "points": 9,
          "aliases": [
            "pang-travel",
            "travel"
          ]
        }
      ]
    },
    {
      "id": "save-money-2",
      "category": "WORK & MONEY",
      "prompt": "Bakit madalas na bakit nag-iipon ng pera ang tao?",
      "answers": [
        {
          "text": "Emergency",
          "points": 27,
          "aliases": [
            "emergency",
            "emergency fund"
          ]
        },
        {
          "text": "Pangarap / goals",
          "points": 22,
          "aliases": [
            "dream",
            "goals",
            "pangarap / goals"
          ]
        },
        {
          "text": "Pambili ng gusto",
          "points": 18,
          "aliases": [
            "buy something",
            "pambili ng gusto",
            "wants"
          ]
        },
        {
          "text": "Pang-aral",
          "points": 13,
          "aliases": [
            "pang-aral",
            "school expenses",
            "tuition"
          ]
        },
        {
          "text": "Pamilya / future",
          "points": 11,
          "aliases": [
            "family",
            "future",
            "pamilya / future"
          ]
        },
        {
          "text": "Pang-travel",
          "points": 9,
          "aliases": [
            "pang-travel",
            "travel"
          ]
        }
      ]
    },
    {
      "id": "save-money-3",
      "category": "WORK & MONEY",
      "prompt": "Magbanggit ng dahilan kung bakit nag-iipon ng pera ang tao.",
      "answers": [
        {
          "text": "Emergency",
          "points": 27,
          "aliases": [
            "emergency",
            "emergency fund"
          ]
        },
        {
          "text": "Pangarap / goals",
          "points": 22,
          "aliases": [
            "dream",
            "goals",
            "pangarap / goals"
          ]
        },
        {
          "text": "Pambili ng gusto",
          "points": 18,
          "aliases": [
            "buy something",
            "pambili ng gusto",
            "wants"
          ]
        },
        {
          "text": "Pang-aral",
          "points": 13,
          "aliases": [
            "pang-aral",
            "school expenses",
            "tuition"
          ]
        },
        {
          "text": "Pamilya / future",
          "points": 11,
          "aliases": [
            "family",
            "future",
            "pamilya / future"
          ]
        },
        {
          "text": "Pang-travel",
          "points": 9,
          "aliases": [
            "pang-travel",
            "travel"
          ]
        }
      ]
    },
    {
      "id": "save-money-4",
      "category": "WORK & MONEY",
      "prompt": "Ano ang isa sa pinaka-common na rason kung bakit nag-iipon ng pera ang tao?",
      "answers": [
        {
          "text": "Emergency",
          "points": 27,
          "aliases": [
            "emergency",
            "emergency fund"
          ]
        },
        {
          "text": "Pangarap / goals",
          "points": 22,
          "aliases": [
            "dream",
            "goals",
            "pangarap / goals"
          ]
        },
        {
          "text": "Pambili ng gusto",
          "points": 18,
          "aliases": [
            "buy something",
            "pambili ng gusto",
            "wants"
          ]
        },
        {
          "text": "Pang-aral",
          "points": 13,
          "aliases": [
            "pang-aral",
            "school expenses",
            "tuition"
          ]
        },
        {
          "text": "Pamilya / future",
          "points": 11,
          "aliases": [
            "family",
            "future",
            "pamilya / future"
          ]
        },
        {
          "text": "Pang-travel",
          "points": 9,
          "aliases": [
            "pang-travel",
            "travel"
          ]
        }
      ]
    },
    {
      "id": "save-money-5",
      "category": "WORK & MONEY",
      "prompt": "Kapag bakit nag-iipon ng pera ang tao, ano ang kadalasang paliwanag?",
      "answers": [
        {
          "text": "Emergency",
          "points": 27,
          "aliases": [
            "emergency",
            "emergency fund"
          ]
        },
        {
          "text": "Pangarap / goals",
          "points": 22,
          "aliases": [
            "dream",
            "goals",
            "pangarap / goals"
          ]
        },
        {
          "text": "Pambili ng gusto",
          "points": 18,
          "aliases": [
            "buy something",
            "pambili ng gusto",
            "wants"
          ]
        },
        {
          "text": "Pang-aral",
          "points": 13,
          "aliases": [
            "pang-aral",
            "school expenses",
            "tuition"
          ]
        },
        {
          "text": "Pamilya / future",
          "points": 11,
          "aliases": [
            "family",
            "future",
            "pamilya / future"
          ]
        },
        {
          "text": "Pang-travel",
          "points": 9,
          "aliases": [
            "pang-travel",
            "travel"
          ]
        }
      ]
    },
    {
      "id": "save-money-6",
      "category": "WORK & MONEY",
      "prompt": "Ano ang dahilan na madalas sabihin ng tao kung bakit nag-iipon ng pera ang tao?",
      "answers": [
        {
          "text": "Emergency",
          "points": 27,
          "aliases": [
            "emergency",
            "emergency fund"
          ]
        },
        {
          "text": "Pangarap / goals",
          "points": 22,
          "aliases": [
            "dream",
            "goals",
            "pangarap / goals"
          ]
        },
        {
          "text": "Pambili ng gusto",
          "points": 18,
          "aliases": [
            "buy something",
            "pambili ng gusto",
            "wants"
          ]
        },
        {
          "text": "Pang-aral",
          "points": 13,
          "aliases": [
            "pang-aral",
            "school expenses",
            "tuition"
          ]
        },
        {
          "text": "Pamilya / future",
          "points": 11,
          "aliases": [
            "family",
            "future",
            "pamilya / future"
          ]
        },
        {
          "text": "Pang-travel",
          "points": 9,
          "aliases": [
            "pang-travel",
            "travel"
          ]
        }
      ]
    },
    {
      "id": "save-money-7",
      "category": "WORK & MONEY",
      "prompt": "Ano ang posibleng sanhi kung bakit nag-iipon ng pera ang tao?",
      "answers": [
        {
          "text": "Emergency",
          "points": 27,
          "aliases": [
            "emergency",
            "emergency fund"
          ]
        },
        {
          "text": "Pangarap / goals",
          "points": 22,
          "aliases": [
            "dream",
            "goals",
            "pangarap / goals"
          ]
        },
        {
          "text": "Pambili ng gusto",
          "points": 18,
          "aliases": [
            "buy something",
            "pambili ng gusto",
            "wants"
          ]
        },
        {
          "text": "Pang-aral",
          "points": 13,
          "aliases": [
            "pang-aral",
            "school expenses",
            "tuition"
          ]
        },
        {
          "text": "Pamilya / future",
          "points": 11,
          "aliases": [
            "family",
            "future",
            "pamilya / future"
          ]
        },
        {
          "text": "Pang-travel",
          "points": 9,
          "aliases": [
            "pang-travel",
            "travel"
          ]
        }
      ]
    },
    {
      "id": "save-money-8",
      "category": "WORK & MONEY",
      "prompt": "Ano ang common na rason kung bakit nag-iipon ng pera ang tao?",
      "answers": [
        {
          "text": "Emergency",
          "points": 27,
          "aliases": [
            "emergency",
            "emergency fund"
          ]
        },
        {
          "text": "Pangarap / goals",
          "points": 22,
          "aliases": [
            "dream",
            "goals",
            "pangarap / goals"
          ]
        },
        {
          "text": "Pambili ng gusto",
          "points": 18,
          "aliases": [
            "buy something",
            "pambili ng gusto",
            "wants"
          ]
        },
        {
          "text": "Pang-aral",
          "points": 13,
          "aliases": [
            "pang-aral",
            "school expenses",
            "tuition"
          ]
        },
        {
          "text": "Pamilya / future",
          "points": 11,
          "aliases": [
            "family",
            "future",
            "pamilya / future"
          ]
        },
        {
          "text": "Pang-travel",
          "points": 9,
          "aliases": [
            "pang-travel",
            "travel"
          ]
        }
      ]
    },
    {
      "id": "post-online-1",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang karaniwang dahilan kung bakit nagpo-post ang tao sa social media?",
      "answers": [
        {
          "text": "Mag-share ng memories",
          "points": 29,
          "aliases": [
            "mag-share ng memories",
            "memories"
          ]
        },
        {
          "text": "Makakuha ng likes / reactions",
          "points": 21,
          "aliases": [
            "likes",
            "makakuha ng likes / reactions",
            "reactions"
          ]
        },
        {
          "text": "Makipag-connect sa friends",
          "points": 16,
          "aliases": [
            "connect",
            "friends",
            "makipag-connect sa friends"
          ]
        },
        {
          "text": "Magbenta / promote",
          "points": 13,
          "aliases": [
            "magbenta / promote",
            "promote",
            "sell"
          ]
        },
        {
          "text": "Maglabas ng saloobin",
          "points": 12,
          "aliases": [
            "express feelings",
            "maglabas ng saloobin"
          ]
        },
        {
          "text": "Makisabay sa trend",
          "points": 9,
          "aliases": [
            "makisabay sa trend",
            "trend"
          ]
        }
      ]
    },
    {
      "id": "post-online-2",
      "category": "SOCIAL MEDIA",
      "prompt": "Bakit madalas na bakit nagpo-post ang tao sa social media?",
      "answers": [
        {
          "text": "Mag-share ng memories",
          "points": 29,
          "aliases": [
            "mag-share ng memories",
            "memories"
          ]
        },
        {
          "text": "Makakuha ng likes / reactions",
          "points": 21,
          "aliases": [
            "likes",
            "makakuha ng likes / reactions",
            "reactions"
          ]
        },
        {
          "text": "Makipag-connect sa friends",
          "points": 16,
          "aliases": [
            "connect",
            "friends",
            "makipag-connect sa friends"
          ]
        },
        {
          "text": "Magbenta / promote",
          "points": 13,
          "aliases": [
            "magbenta / promote",
            "promote",
            "sell"
          ]
        },
        {
          "text": "Maglabas ng saloobin",
          "points": 12,
          "aliases": [
            "express feelings",
            "maglabas ng saloobin"
          ]
        },
        {
          "text": "Makisabay sa trend",
          "points": 9,
          "aliases": [
            "makisabay sa trend",
            "trend"
          ]
        }
      ]
    },
    {
      "id": "post-online-3",
      "category": "SOCIAL MEDIA",
      "prompt": "Magbanggit ng dahilan kung bakit nagpo-post ang tao sa social media.",
      "answers": [
        {
          "text": "Mag-share ng memories",
          "points": 29,
          "aliases": [
            "mag-share ng memories",
            "memories"
          ]
        },
        {
          "text": "Makakuha ng likes / reactions",
          "points": 21,
          "aliases": [
            "likes",
            "makakuha ng likes / reactions",
            "reactions"
          ]
        },
        {
          "text": "Makipag-connect sa friends",
          "points": 16,
          "aliases": [
            "connect",
            "friends",
            "makipag-connect sa friends"
          ]
        },
        {
          "text": "Magbenta / promote",
          "points": 13,
          "aliases": [
            "magbenta / promote",
            "promote",
            "sell"
          ]
        },
        {
          "text": "Maglabas ng saloobin",
          "points": 12,
          "aliases": [
            "express feelings",
            "maglabas ng saloobin"
          ]
        },
        {
          "text": "Makisabay sa trend",
          "points": 9,
          "aliases": [
            "makisabay sa trend",
            "trend"
          ]
        }
      ]
    },
    {
      "id": "post-online-4",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang isa sa pinaka-common na rason kung bakit nagpo-post ang tao sa social media?",
      "answers": [
        {
          "text": "Mag-share ng memories",
          "points": 29,
          "aliases": [
            "mag-share ng memories",
            "memories"
          ]
        },
        {
          "text": "Makakuha ng likes / reactions",
          "points": 21,
          "aliases": [
            "likes",
            "makakuha ng likes / reactions",
            "reactions"
          ]
        },
        {
          "text": "Makipag-connect sa friends",
          "points": 16,
          "aliases": [
            "connect",
            "friends",
            "makipag-connect sa friends"
          ]
        },
        {
          "text": "Magbenta / promote",
          "points": 13,
          "aliases": [
            "magbenta / promote",
            "promote",
            "sell"
          ]
        },
        {
          "text": "Maglabas ng saloobin",
          "points": 12,
          "aliases": [
            "express feelings",
            "maglabas ng saloobin"
          ]
        },
        {
          "text": "Makisabay sa trend",
          "points": 9,
          "aliases": [
            "makisabay sa trend",
            "trend"
          ]
        }
      ]
    },
    {
      "id": "post-online-5",
      "category": "SOCIAL MEDIA",
      "prompt": "Kapag bakit nagpo-post ang tao sa social media, ano ang kadalasang paliwanag?",
      "answers": [
        {
          "text": "Mag-share ng memories",
          "points": 29,
          "aliases": [
            "mag-share ng memories",
            "memories"
          ]
        },
        {
          "text": "Makakuha ng likes / reactions",
          "points": 21,
          "aliases": [
            "likes",
            "makakuha ng likes / reactions",
            "reactions"
          ]
        },
        {
          "text": "Makipag-connect sa friends",
          "points": 16,
          "aliases": [
            "connect",
            "friends",
            "makipag-connect sa friends"
          ]
        },
        {
          "text": "Magbenta / promote",
          "points": 13,
          "aliases": [
            "magbenta / promote",
            "promote",
            "sell"
          ]
        },
        {
          "text": "Maglabas ng saloobin",
          "points": 12,
          "aliases": [
            "express feelings",
            "maglabas ng saloobin"
          ]
        },
        {
          "text": "Makisabay sa trend",
          "points": 9,
          "aliases": [
            "makisabay sa trend",
            "trend"
          ]
        }
      ]
    },
    {
      "id": "post-online-6",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang dahilan na madalas sabihin ng tao kung bakit nagpo-post ang tao sa social media?",
      "answers": [
        {
          "text": "Mag-share ng memories",
          "points": 29,
          "aliases": [
            "mag-share ng memories",
            "memories"
          ]
        },
        {
          "text": "Makakuha ng likes / reactions",
          "points": 21,
          "aliases": [
            "likes",
            "makakuha ng likes / reactions",
            "reactions"
          ]
        },
        {
          "text": "Makipag-connect sa friends",
          "points": 16,
          "aliases": [
            "connect",
            "friends",
            "makipag-connect sa friends"
          ]
        },
        {
          "text": "Magbenta / promote",
          "points": 13,
          "aliases": [
            "magbenta / promote",
            "promote",
            "sell"
          ]
        },
        {
          "text": "Maglabas ng saloobin",
          "points": 12,
          "aliases": [
            "express feelings",
            "maglabas ng saloobin"
          ]
        },
        {
          "text": "Makisabay sa trend",
          "points": 9,
          "aliases": [
            "makisabay sa trend",
            "trend"
          ]
        }
      ]
    },
    {
      "id": "post-online-7",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang posibleng sanhi kung bakit nagpo-post ang tao sa social media?",
      "answers": [
        {
          "text": "Mag-share ng memories",
          "points": 29,
          "aliases": [
            "mag-share ng memories",
            "memories"
          ]
        },
        {
          "text": "Makakuha ng likes / reactions",
          "points": 21,
          "aliases": [
            "likes",
            "makakuha ng likes / reactions",
            "reactions"
          ]
        },
        {
          "text": "Makipag-connect sa friends",
          "points": 16,
          "aliases": [
            "connect",
            "friends",
            "makipag-connect sa friends"
          ]
        },
        {
          "text": "Magbenta / promote",
          "points": 13,
          "aliases": [
            "magbenta / promote",
            "promote",
            "sell"
          ]
        },
        {
          "text": "Maglabas ng saloobin",
          "points": 12,
          "aliases": [
            "express feelings",
            "maglabas ng saloobin"
          ]
        },
        {
          "text": "Makisabay sa trend",
          "points": 9,
          "aliases": [
            "makisabay sa trend",
            "trend"
          ]
        }
      ]
    },
    {
      "id": "post-online-8",
      "category": "SOCIAL MEDIA",
      "prompt": "Ano ang common na rason kung bakit nagpo-post ang tao sa social media?",
      "answers": [
        {
          "text": "Mag-share ng memories",
          "points": 29,
          "aliases": [
            "mag-share ng memories",
            "memories"
          ]
        },
        {
          "text": "Makakuha ng likes / reactions",
          "points": 21,
          "aliases": [
            "likes",
            "makakuha ng likes / reactions",
            "reactions"
          ]
        },
        {
          "text": "Makipag-connect sa friends",
          "points": 16,
          "aliases": [
            "connect",
            "friends",
            "makipag-connect sa friends"
          ]
        },
        {
          "text": "Magbenta / promote",
          "points": 13,
          "aliases": [
            "magbenta / promote",
            "promote",
            "sell"
          ]
        },
        {
          "text": "Maglabas ng saloobin",
          "points": 12,
          "aliases": [
            "express feelings",
            "maglabas ng saloobin"
          ]
        },
        {
          "text": "Makisabay sa trend",
          "points": 9,
          "aliases": [
            "makisabay sa trend",
            "trend"
          ]
        }
      ]
    },
    {
      "id": "miss-the-bus-1",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang karaniwang dahilan kung bakit nahuhuli ang tao sa masasakyan?",
      "answers": [
        {
          "text": "Late umalis",
          "points": 26,
          "aliases": [
            "late leave",
            "late umalis"
          ]
        },
        {
          "text": "Traffic",
          "points": 22,
          "aliases": [
            "na traffic",
            "traffic"
          ]
        },
        {
          "text": "Mahaba ang pila",
          "points": 18,
          "aliases": [
            "line",
            "mahaba ang pila",
            "queue"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 14,
          "aliases": [
            "mabagal maghanda",
            "slow prep"
          ]
        },
        {
          "text": "Walang dumadaan",
          "points": 12,
          "aliases": [
            "no vehicle",
            "walang dumadaan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "miss-the-bus-2",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Bakit madalas na bakit nahuhuli ang tao sa masasakyan?",
      "answers": [
        {
          "text": "Late umalis",
          "points": 26,
          "aliases": [
            "late leave",
            "late umalis"
          ]
        },
        {
          "text": "Traffic",
          "points": 22,
          "aliases": [
            "na traffic",
            "traffic"
          ]
        },
        {
          "text": "Mahaba ang pila",
          "points": 18,
          "aliases": [
            "line",
            "mahaba ang pila",
            "queue"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 14,
          "aliases": [
            "mabagal maghanda",
            "slow prep"
          ]
        },
        {
          "text": "Walang dumadaan",
          "points": 12,
          "aliases": [
            "no vehicle",
            "walang dumadaan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "miss-the-bus-3",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Magbanggit ng dahilan kung bakit nahuhuli ang tao sa masasakyan.",
      "answers": [
        {
          "text": "Late umalis",
          "points": 26,
          "aliases": [
            "late leave",
            "late umalis"
          ]
        },
        {
          "text": "Traffic",
          "points": 22,
          "aliases": [
            "na traffic",
            "traffic"
          ]
        },
        {
          "text": "Mahaba ang pila",
          "points": 18,
          "aliases": [
            "line",
            "mahaba ang pila",
            "queue"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 14,
          "aliases": [
            "mabagal maghanda",
            "slow prep"
          ]
        },
        {
          "text": "Walang dumadaan",
          "points": 12,
          "aliases": [
            "no vehicle",
            "walang dumadaan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "miss-the-bus-4",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang isa sa pinaka-common na rason kung bakit nahuhuli ang tao sa masasakyan?",
      "answers": [
        {
          "text": "Late umalis",
          "points": 26,
          "aliases": [
            "late leave",
            "late umalis"
          ]
        },
        {
          "text": "Traffic",
          "points": 22,
          "aliases": [
            "na traffic",
            "traffic"
          ]
        },
        {
          "text": "Mahaba ang pila",
          "points": 18,
          "aliases": [
            "line",
            "mahaba ang pila",
            "queue"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 14,
          "aliases": [
            "mabagal maghanda",
            "slow prep"
          ]
        },
        {
          "text": "Walang dumadaan",
          "points": 12,
          "aliases": [
            "no vehicle",
            "walang dumadaan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "miss-the-bus-5",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Kapag bakit nahuhuli ang tao sa masasakyan, ano ang kadalasang paliwanag?",
      "answers": [
        {
          "text": "Late umalis",
          "points": 26,
          "aliases": [
            "late leave",
            "late umalis"
          ]
        },
        {
          "text": "Traffic",
          "points": 22,
          "aliases": [
            "na traffic",
            "traffic"
          ]
        },
        {
          "text": "Mahaba ang pila",
          "points": 18,
          "aliases": [
            "line",
            "mahaba ang pila",
            "queue"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 14,
          "aliases": [
            "mabagal maghanda",
            "slow prep"
          ]
        },
        {
          "text": "Walang dumadaan",
          "points": 12,
          "aliases": [
            "no vehicle",
            "walang dumadaan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "miss-the-bus-6",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang dahilan na madalas sabihin ng tao kung bakit nahuhuli ang tao sa masasakyan?",
      "answers": [
        {
          "text": "Late umalis",
          "points": 26,
          "aliases": [
            "late leave",
            "late umalis"
          ]
        },
        {
          "text": "Traffic",
          "points": 22,
          "aliases": [
            "na traffic",
            "traffic"
          ]
        },
        {
          "text": "Mahaba ang pila",
          "points": 18,
          "aliases": [
            "line",
            "mahaba ang pila",
            "queue"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 14,
          "aliases": [
            "mabagal maghanda",
            "slow prep"
          ]
        },
        {
          "text": "Walang dumadaan",
          "points": 12,
          "aliases": [
            "no vehicle",
            "walang dumadaan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "miss-the-bus-7",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang posibleng sanhi kung bakit nahuhuli ang tao sa masasakyan?",
      "answers": [
        {
          "text": "Late umalis",
          "points": 26,
          "aliases": [
            "late leave",
            "late umalis"
          ]
        },
        {
          "text": "Traffic",
          "points": 22,
          "aliases": [
            "na traffic",
            "traffic"
          ]
        },
        {
          "text": "Mahaba ang pila",
          "points": 18,
          "aliases": [
            "line",
            "mahaba ang pila",
            "queue"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 14,
          "aliases": [
            "mabagal maghanda",
            "slow prep"
          ]
        },
        {
          "text": "Walang dumadaan",
          "points": 12,
          "aliases": [
            "no vehicle",
            "walang dumadaan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "miss-the-bus-8",
      "category": "WEATHER & DAILY LIFE",
      "prompt": "Ano ang common na rason kung bakit nahuhuli ang tao sa masasakyan?",
      "answers": [
        {
          "text": "Late umalis",
          "points": 26,
          "aliases": [
            "late leave",
            "late umalis"
          ]
        },
        {
          "text": "Traffic",
          "points": 22,
          "aliases": [
            "na traffic",
            "traffic"
          ]
        },
        {
          "text": "Mahaba ang pila",
          "points": 18,
          "aliases": [
            "line",
            "mahaba ang pila",
            "queue"
          ]
        },
        {
          "text": "Mabagal maghanda",
          "points": 14,
          "aliases": [
            "mabagal maghanda",
            "slow prep"
          ]
        },
        {
          "text": "Walang dumadaan",
          "points": 12,
          "aliases": [
            "no vehicle",
            "walang dumadaan"
          ]
        },
        {
          "text": "May nakalimutan",
          "points": 8,
          "aliases": [
            "forgot something",
            "may nakalimutan"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-reasons-1",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang karaniwang dahilan kung bakit mabagal ang internet sa bahay?",
      "answers": [
        {
          "text": "Mahina ang signal",
          "points": 30,
          "aliases": [
            "mahina ang signal",
            "weak signal"
          ]
        },
        {
          "text": "Maraming gumagamit",
          "points": 22,
          "aliases": [
            "many users",
            "maraming gumagamit"
          ]
        },
        {
          "text": "Malayo sa router",
          "points": 17,
          "aliases": [
            "far from router",
            "malayo sa router"
          ]
        },
        {
          "text": "May outage",
          "points": 13,
          "aliases": [
            "line issue",
            "may outage",
            "outage"
          ]
        },
        {
          "text": "Luma ang router",
          "points": 10,
          "aliases": [
            "luma ang router",
            "old router"
          ]
        },
        {
          "text": "Mabagal ang plan",
          "points": 8,
          "aliases": [
            "mabagal ang plan",
            "slow plan"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-reasons-2",
      "category": "TECH & GADGETS",
      "prompt": "Bakit madalas na bakit mabagal ang internet sa bahay?",
      "answers": [
        {
          "text": "Mahina ang signal",
          "points": 30,
          "aliases": [
            "mahina ang signal",
            "weak signal"
          ]
        },
        {
          "text": "Maraming gumagamit",
          "points": 22,
          "aliases": [
            "many users",
            "maraming gumagamit"
          ]
        },
        {
          "text": "Malayo sa router",
          "points": 17,
          "aliases": [
            "far from router",
            "malayo sa router"
          ]
        },
        {
          "text": "May outage",
          "points": 13,
          "aliases": [
            "line issue",
            "may outage",
            "outage"
          ]
        },
        {
          "text": "Luma ang router",
          "points": 10,
          "aliases": [
            "luma ang router",
            "old router"
          ]
        },
        {
          "text": "Mabagal ang plan",
          "points": 8,
          "aliases": [
            "mabagal ang plan",
            "slow plan"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-reasons-3",
      "category": "TECH & GADGETS",
      "prompt": "Magbanggit ng dahilan kung bakit mabagal ang internet sa bahay.",
      "answers": [
        {
          "text": "Mahina ang signal",
          "points": 30,
          "aliases": [
            "mahina ang signal",
            "weak signal"
          ]
        },
        {
          "text": "Maraming gumagamit",
          "points": 22,
          "aliases": [
            "many users",
            "maraming gumagamit"
          ]
        },
        {
          "text": "Malayo sa router",
          "points": 17,
          "aliases": [
            "far from router",
            "malayo sa router"
          ]
        },
        {
          "text": "May outage",
          "points": 13,
          "aliases": [
            "line issue",
            "may outage",
            "outage"
          ]
        },
        {
          "text": "Luma ang router",
          "points": 10,
          "aliases": [
            "luma ang router",
            "old router"
          ]
        },
        {
          "text": "Mabagal ang plan",
          "points": 8,
          "aliases": [
            "mabagal ang plan",
            "slow plan"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-reasons-4",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang isa sa pinaka-common na rason kung bakit mabagal ang internet sa bahay?",
      "answers": [
        {
          "text": "Mahina ang signal",
          "points": 30,
          "aliases": [
            "mahina ang signal",
            "weak signal"
          ]
        },
        {
          "text": "Maraming gumagamit",
          "points": 22,
          "aliases": [
            "many users",
            "maraming gumagamit"
          ]
        },
        {
          "text": "Malayo sa router",
          "points": 17,
          "aliases": [
            "far from router",
            "malayo sa router"
          ]
        },
        {
          "text": "May outage",
          "points": 13,
          "aliases": [
            "line issue",
            "may outage",
            "outage"
          ]
        },
        {
          "text": "Luma ang router",
          "points": 10,
          "aliases": [
            "luma ang router",
            "old router"
          ]
        },
        {
          "text": "Mabagal ang plan",
          "points": 8,
          "aliases": [
            "mabagal ang plan",
            "slow plan"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-reasons-5",
      "category": "TECH & GADGETS",
      "prompt": "Kapag bakit mabagal ang internet sa bahay, ano ang kadalasang paliwanag?",
      "answers": [
        {
          "text": "Mahina ang signal",
          "points": 30,
          "aliases": [
            "mahina ang signal",
            "weak signal"
          ]
        },
        {
          "text": "Maraming gumagamit",
          "points": 22,
          "aliases": [
            "many users",
            "maraming gumagamit"
          ]
        },
        {
          "text": "Malayo sa router",
          "points": 17,
          "aliases": [
            "far from router",
            "malayo sa router"
          ]
        },
        {
          "text": "May outage",
          "points": 13,
          "aliases": [
            "line issue",
            "may outage",
            "outage"
          ]
        },
        {
          "text": "Luma ang router",
          "points": 10,
          "aliases": [
            "luma ang router",
            "old router"
          ]
        },
        {
          "text": "Mabagal ang plan",
          "points": 8,
          "aliases": [
            "mabagal ang plan",
            "slow plan"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-reasons-6",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang dahilan na madalas sabihin ng tao kung bakit mabagal ang internet sa bahay?",
      "answers": [
        {
          "text": "Mahina ang signal",
          "points": 30,
          "aliases": [
            "mahina ang signal",
            "weak signal"
          ]
        },
        {
          "text": "Maraming gumagamit",
          "points": 22,
          "aliases": [
            "many users",
            "maraming gumagamit"
          ]
        },
        {
          "text": "Malayo sa router",
          "points": 17,
          "aliases": [
            "far from router",
            "malayo sa router"
          ]
        },
        {
          "text": "May outage",
          "points": 13,
          "aliases": [
            "line issue",
            "may outage",
            "outage"
          ]
        },
        {
          "text": "Luma ang router",
          "points": 10,
          "aliases": [
            "luma ang router",
            "old router"
          ]
        },
        {
          "text": "Mabagal ang plan",
          "points": 8,
          "aliases": [
            "mabagal ang plan",
            "slow plan"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-reasons-7",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang posibleng sanhi kung bakit mabagal ang internet sa bahay?",
      "answers": [
        {
          "text": "Mahina ang signal",
          "points": 30,
          "aliases": [
            "mahina ang signal",
            "weak signal"
          ]
        },
        {
          "text": "Maraming gumagamit",
          "points": 22,
          "aliases": [
            "many users",
            "maraming gumagamit"
          ]
        },
        {
          "text": "Malayo sa router",
          "points": 17,
          "aliases": [
            "far from router",
            "malayo sa router"
          ]
        },
        {
          "text": "May outage",
          "points": 13,
          "aliases": [
            "line issue",
            "may outage",
            "outage"
          ]
        },
        {
          "text": "Luma ang router",
          "points": 10,
          "aliases": [
            "luma ang router",
            "old router"
          ]
        },
        {
          "text": "Mabagal ang plan",
          "points": 8,
          "aliases": [
            "mabagal ang plan",
            "slow plan"
          ]
        }
      ]
    },
    {
      "id": "slow-internet-reasons-8",
      "category": "TECH & GADGETS",
      "prompt": "Ano ang common na rason kung bakit mabagal ang internet sa bahay?",
      "answers": [
        {
          "text": "Mahina ang signal",
          "points": 30,
          "aliases": [
            "mahina ang signal",
            "weak signal"
          ]
        },
        {
          "text": "Maraming gumagamit",
          "points": 22,
          "aliases": [
            "many users",
            "maraming gumagamit"
          ]
        },
        {
          "text": "Malayo sa router",
          "points": 17,
          "aliases": [
            "far from router",
            "malayo sa router"
          ]
        },
        {
          "text": "May outage",
          "points": 13,
          "aliases": [
            "line issue",
            "may outage",
            "outage"
          ]
        },
        {
          "text": "Luma ang router",
          "points": 10,
          "aliases": [
            "luma ang router",
            "old router"
          ]
        },
        {
          "text": "Mabagal ang plan",
          "points": 8,
          "aliases": [
            "mabagal ang plan",
            "slow plan"
          ]
        }
      ]
    },
    {
      "id": "drink-coffee-1",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang karaniwang dahilan kung bakit umiinom ng kape ang tao?",
      "answers": [
        {
          "text": "Para magising",
          "points": 28,
          "aliases": [
            "para magising",
            "stay awake",
            "wake up"
          ]
        },
        {
          "text": "Masarap",
          "points": 21,
          "aliases": [
            "masarap",
            "tastes good"
          ]
        },
        {
          "text": "Habit / routine",
          "points": 17,
          "aliases": [
            "habit",
            "habit / routine",
            "routine"
          ]
        },
        {
          "text": "Pampaalis antok habang nag-aaral/trabaho",
          "points": 14,
          "aliases": [
            "pampaalis antok habang nag-aaral/trabaho",
            "study",
            "work"
          ]
        },
        {
          "text": "Pang-relax",
          "points": 11,
          "aliases": [
            "pang-relax",
            "relax"
          ]
        },
        {
          "text": "Malamig ang panahon",
          "points": 9,
          "aliases": [
            "cold weather",
            "malamig ang panahon"
          ]
        }
      ]
    },
    {
      "id": "drink-coffee-2",
      "category": "FOOD & DRINK",
      "prompt": "Bakit madalas na bakit umiinom ng kape ang tao?",
      "answers": [
        {
          "text": "Para magising",
          "points": 28,
          "aliases": [
            "para magising",
            "stay awake",
            "wake up"
          ]
        },
        {
          "text": "Masarap",
          "points": 21,
          "aliases": [
            "masarap",
            "tastes good"
          ]
        },
        {
          "text": "Habit / routine",
          "points": 17,
          "aliases": [
            "habit",
            "habit / routine",
            "routine"
          ]
        },
        {
          "text": "Pampaalis antok habang nag-aaral/trabaho",
          "points": 14,
          "aliases": [
            "pampaalis antok habang nag-aaral/trabaho",
            "study",
            "work"
          ]
        },
        {
          "text": "Pang-relax",
          "points": 11,
          "aliases": [
            "pang-relax",
            "relax"
          ]
        },
        {
          "text": "Malamig ang panahon",
          "points": 9,
          "aliases": [
            "cold weather",
            "malamig ang panahon"
          ]
        }
      ]
    },
    {
      "id": "drink-coffee-3",
      "category": "FOOD & DRINK",
      "prompt": "Magbanggit ng dahilan kung bakit umiinom ng kape ang tao.",
      "answers": [
        {
          "text": "Para magising",
          "points": 28,
          "aliases": [
            "para magising",
            "stay awake",
            "wake up"
          ]
        },
        {
          "text": "Masarap",
          "points": 21,
          "aliases": [
            "masarap",
            "tastes good"
          ]
        },
        {
          "text": "Habit / routine",
          "points": 17,
          "aliases": [
            "habit",
            "habit / routine",
            "routine"
          ]
        },
        {
          "text": "Pampaalis antok habang nag-aaral/trabaho",
          "points": 14,
          "aliases": [
            "pampaalis antok habang nag-aaral/trabaho",
            "study",
            "work"
          ]
        },
        {
          "text": "Pang-relax",
          "points": 11,
          "aliases": [
            "pang-relax",
            "relax"
          ]
        },
        {
          "text": "Malamig ang panahon",
          "points": 9,
          "aliases": [
            "cold weather",
            "malamig ang panahon"
          ]
        }
      ]
    },
    {
      "id": "drink-coffee-4",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang isa sa pinaka-common na rason kung bakit umiinom ng kape ang tao?",
      "answers": [
        {
          "text": "Para magising",
          "points": 28,
          "aliases": [
            "para magising",
            "stay awake",
            "wake up"
          ]
        },
        {
          "text": "Masarap",
          "points": 21,
          "aliases": [
            "masarap",
            "tastes good"
          ]
        },
        {
          "text": "Habit / routine",
          "points": 17,
          "aliases": [
            "habit",
            "habit / routine",
            "routine"
          ]
        },
        {
          "text": "Pampaalis antok habang nag-aaral/trabaho",
          "points": 14,
          "aliases": [
            "pampaalis antok habang nag-aaral/trabaho",
            "study",
            "work"
          ]
        },
        {
          "text": "Pang-relax",
          "points": 11,
          "aliases": [
            "pang-relax",
            "relax"
          ]
        },
        {
          "text": "Malamig ang panahon",
          "points": 9,
          "aliases": [
            "cold weather",
            "malamig ang panahon"
          ]
        }
      ]
    },
    {
      "id": "drink-coffee-5",
      "category": "FOOD & DRINK",
      "prompt": "Kapag bakit umiinom ng kape ang tao, ano ang kadalasang paliwanag?",
      "answers": [
        {
          "text": "Para magising",
          "points": 28,
          "aliases": [
            "para magising",
            "stay awake",
            "wake up"
          ]
        },
        {
          "text": "Masarap",
          "points": 21,
          "aliases": [
            "masarap",
            "tastes good"
          ]
        },
        {
          "text": "Habit / routine",
          "points": 17,
          "aliases": [
            "habit",
            "habit / routine",
            "routine"
          ]
        },
        {
          "text": "Pampaalis antok habang nag-aaral/trabaho",
          "points": 14,
          "aliases": [
            "pampaalis antok habang nag-aaral/trabaho",
            "study",
            "work"
          ]
        },
        {
          "text": "Pang-relax",
          "points": 11,
          "aliases": [
            "pang-relax",
            "relax"
          ]
        },
        {
          "text": "Malamig ang panahon",
          "points": 9,
          "aliases": [
            "cold weather",
            "malamig ang panahon"
          ]
        }
      ]
    },
    {
      "id": "drink-coffee-6",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang dahilan na madalas sabihin ng tao kung bakit umiinom ng kape ang tao?",
      "answers": [
        {
          "text": "Para magising",
          "points": 28,
          "aliases": [
            "para magising",
            "stay awake",
            "wake up"
          ]
        },
        {
          "text": "Masarap",
          "points": 21,
          "aliases": [
            "masarap",
            "tastes good"
          ]
        },
        {
          "text": "Habit / routine",
          "points": 17,
          "aliases": [
            "habit",
            "habit / routine",
            "routine"
          ]
        },
        {
          "text": "Pampaalis antok habang nag-aaral/trabaho",
          "points": 14,
          "aliases": [
            "pampaalis antok habang nag-aaral/trabaho",
            "study",
            "work"
          ]
        },
        {
          "text": "Pang-relax",
          "points": 11,
          "aliases": [
            "pang-relax",
            "relax"
          ]
        },
        {
          "text": "Malamig ang panahon",
          "points": 9,
          "aliases": [
            "cold weather",
            "malamig ang panahon"
          ]
        }
      ]
    },
    {
      "id": "drink-coffee-7",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang posibleng sanhi kung bakit umiinom ng kape ang tao?",
      "answers": [
        {
          "text": "Para magising",
          "points": 28,
          "aliases": [
            "para magising",
            "stay awake",
            "wake up"
          ]
        },
        {
          "text": "Masarap",
          "points": 21,
          "aliases": [
            "masarap",
            "tastes good"
          ]
        },
        {
          "text": "Habit / routine",
          "points": 17,
          "aliases": [
            "habit",
            "habit / routine",
            "routine"
          ]
        },
        {
          "text": "Pampaalis antok habang nag-aaral/trabaho",
          "points": 14,
          "aliases": [
            "pampaalis antok habang nag-aaral/trabaho",
            "study",
            "work"
          ]
        },
        {
          "text": "Pang-relax",
          "points": 11,
          "aliases": [
            "pang-relax",
            "relax"
          ]
        },
        {
          "text": "Malamig ang panahon",
          "points": 9,
          "aliases": [
            "cold weather",
            "malamig ang panahon"
          ]
        }
      ]
    },
    {
      "id": "drink-coffee-8",
      "category": "FOOD & DRINK",
      "prompt": "Ano ang common na rason kung bakit umiinom ng kape ang tao?",
      "answers": [
        {
          "text": "Para magising",
          "points": 28,
          "aliases": [
            "para magising",
            "stay awake",
            "wake up"
          ]
        },
        {
          "text": "Masarap",
          "points": 21,
          "aliases": [
            "masarap",
            "tastes good"
          ]
        },
        {
          "text": "Habit / routine",
          "points": 17,
          "aliases": [
            "habit",
            "habit / routine",
            "routine"
          ]
        },
        {
          "text": "Pampaalis antok habang nag-aaral/trabaho",
          "points": 14,
          "aliases": [
            "pampaalis antok habang nag-aaral/trabaho",
            "study",
            "work"
          ]
        },
        {
          "text": "Pang-relax",
          "points": 11,
          "aliases": [
            "pang-relax",
            "relax"
          ]
        },
        {
          "text": "Malamig ang panahon",
          "points": 9,
          "aliases": [
            "cold weather",
            "malamig ang panahon"
          ]
        }
      ]
    }
  ];


  function cloneAnswerForExtendedBank(answer) {
    const text = String(answer && answer.text || '').trim();
    const aliasList = Array.isArray(answer && answer.aliases) ? answer.aliases.slice() : [];
    const normalized = text.toLowerCase();
    const compact = normalized.replace(/\s+/g, ' ').trim();
    if (normalized && !aliasList.includes(normalized)) aliasList.push(normalized);
    if (compact && !aliasList.includes(compact)) aliasList.push(compact);
    return {
      text: text,
      points: Number(answer && answer.points) || 0,
      aliases: aliasList
    };
  }

  function buildPromptVariant(prompt, index) {
    const original = String(prompt || '').trim().replace(/\s+/g, ' ');
    const core = original.replace(/[.?!]+\s*$/, '');
    const hasQuestion = /\?$/.test(original);
    const frames = [
      p => `Pinoy Feud bonus round: ${p}.`,
      p => `Top survey answers only — ${p}.`,
      p => `Quick answer round: ${p}.`,
      p => `Family survey question: ${p}.`,
      p => `Sa tingin ng karamihan, ${p}${hasQuestion ? '' : '?'}`,
      p => `Board question: ${p}.`,
      p => `Showtime round — ${p}.`
    ];
    return frames[index % frames.length](core || 'Magbanggit ng sagot');
  }

  function extendQuestionBank(seedQuestions, targetCount) {
    const seed = Array.isArray(seedQuestions) ? seedQuestions.slice() : [];
    const usedIds = new Set(seed.map(q => q && q.id));
    const extras = [];
    let variantPass = 1;
    while (seed.length + extras.length < targetCount) {
      const base = seed[extras.length % seed.length];
      if (!base || !base.id) {
        variantPass += 1;
        continue;
      }
      const id = `${base.id}-extended-${variantPass}`;
      variantPass += 1;
      if (usedIds.has(id)) continue;
      extras.push({
        id,
        category: base.category || 'RANDOM',
        prompt: buildPromptVariant(base.prompt, variantPass + extras.length),
        answers: Array.isArray(base.answers) ? base.answers.map(cloneAnswerForExtendedBank) : []
      });
      usedIds.add(id);
    }
    if (extras.length) Q.push(...extras);
  }

  extendQuestionBank(Q, 3075);

  const CATEGORIES = Object.freeze([
    "RANDOM",
    "CELEBRATIONS",
    "ENTERTAINMENT",
    "FAMILY & HOME",
    "FOOD & DRINK",
    "HEALTH & WELLNESS",
    "PINOY CULTURE",
    "SCHOOL LIFE",
    "SHOPPING & MONEY",
    "SOCIAL MEDIA",
    "SPORTS & FUN",
    "TECH & GADGETS",
    "TEEN LIFE",
    "TRAVEL & OUTDOOR",
    "WEATHER & DAILY LIFE",
    "WEEKEND FUN",
    "WORK & MONEY"
  ]);
  window.ICT8PinoyFeudQuestions = Object.freeze({ questions: Object.freeze(Q), categories: CATEGORIES });
})();
