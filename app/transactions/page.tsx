"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState, useMemo } from "react";
import Wrapper from "../components/Wrapper"; 
import { Transaction, Product } from "@/types"; 
import { getTransaction, readProduct } from "@/app/actions/index"; 
import EmphyState from "../components/EmphyState"; 
import TransactionComponent from "../components/TransactionComponent"; 
import { ListRestart } from "lucide-react";

// Nombre d'éléments par page pour la pagination
const ITEMS_PER_PAGE = 5;


const page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [transaction, setTransaction] = useState<Transaction[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dateFrom, setDateFrom] = useState<string>(""); 
  const [dateTo, setDateTo] = useState<string>("");
  const [fileteredTransaction, setFileteredTransaction] = useState<
    Transaction[]
  >([]); 
  const [currenPage, setCurrentPage] = useState<number>(1); 

  /**
   * fetchData
   * - Charge depuis le serveur les produits et transactions pour l'utilisateur
   * - Utilise les actions centralisées dans `app/actions.ts`
   * - Gère les erreurs en console (TODO: afficher une UI d'erreur si besoin)
   */
  const fetchData = async () => {
    try {
      if (email) {
        const products = await readProduct(email);
        const txs = await getTransaction(email);
        if (products) {
          setProducts(products);
        }
        if (txs) {
          setTransaction(txs);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (email) {
      fetchData();
    }
  }, [email]);

  
  useEffect(() => {
    let filtered = transaction;

    // Filtre par produit si sélectionné
    if (selectedProduct) {
      filtered = filtered.filter((tx) => tx.productId === selectedProduct.id);
    }

    // Filtre par date de début
    if (dateFrom) {
      filtered = filtered.filter(
        (tx) => new Date(tx.createdAt) <= new Date(dateFrom)
      );
    }

    // Filtre par date de fin
    if (dateTo) {
      filtered = filtered.filter(
        (tx) => new Date(tx.createdAt) <= new Date(dateTo)
      );
    }

    setFileteredTransaction(filtered);
    setCurrentPage(1);
  }, [selectedProduct, dateFrom, dateTo, transaction]);

  // Calcul du nombre total de pages
  const totalPages = useMemo(
    () => Math.ceil(fileteredTransaction.length / ITEMS_PER_PAGE),
    [fileteredTransaction.length]
  );

  // Si le nombre total de pages diminue (par ex. suite à un filtre), on ajuste la page courante
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1); // garder la page à 1 si pas de résultats
    } else if (currenPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currenPage]);

  // Index du premier élément sur la page courante
  const startIndex = useMemo(
    () => (currenPage - 1) * ITEMS_PER_PAGE,
    [currenPage]
  );

  // Transactions affichées sur la page courante 
  const currentTransactions = useMemo(
    () => fileteredTransaction.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [fileteredTransaction, startIndex]
  );

  return (
    <Wrapper>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex md:justify-between w-full mb-4 space-x-2 md:space-x-0">
          <div>
            <select
              name=""
              id=""
              className="select select-bordered"
              value={selectedProduct?.id || ""}
              onChange={(e) => {
                const product =
                  products.find((p) => p.id === e.target.value) || null;
                setSelectedProduct(product);
              }}
            >
              <option>Tout les produits</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

      
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="date de début"
              className="input input-bordered"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
            />

            <input
              type="text"
              placeholder="date de fin"
              className="input input-bordered"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
            />

            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedProduct(null);
                setDateFrom("");
                setDateTo("");
              }}
            >
              <ListRestart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Affichage : message si aucune transaction, sinon la liste paginée */}
        {transaction.length == 0 ? (
          <div className="ml-17 mt-20">
            <EmphyState
              message="Aucun transaction pour le moment"
              IconComponent="ScanLine"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            {currentTransactions.map((tx) => (
              <TransactionComponent key={tx.id} tx={tx} />
            ))}
          </div>
        )}

        {/* Pagination : n'affiche que si le nombre de résultats dépasse ITEMS_PER_PAGE */}
        {fileteredTransaction.length > ITEMS_PER_PAGE && (
          <div className="join grid grid-cols-3 space-x-3">
            <button
              className="join-item btn btn-outline btn-soft btn-primary"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currenPage === 1}
            >
              «
            </button>
            <div className="text-primary text-sm">
              Page {currenPage}/{totalPages}
            </div>
            <button
              className="join-item btn btn-outline btn-soft btn-primary"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currenPage === totalPages}
            >
              »
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default page;
