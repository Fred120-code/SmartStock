"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState, useMemo } from "react";
import Wrapper from "../components/Wrapper";
import { Transaction, Product } from "@/types";
import { getTransaction, readProduct } from "../actions";
import EmphyState from "../components/EmphyState";
import TransactionComponent from "../components/TransactionComponent";
import { ListRestart } from "lucide-react";

const ITEMS_PER_PAGE = 5;
const page = () => {
  // Récupère l'utilisateur connecté et son email
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
   * Fonction pour charger les produits de l'utilisateur connecté
   * Appelle l'action readProduct côté serveur, puis met à jour le state
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
      // Affiche l'erreur en cas d'échec
      console.error(error);
    }
  };

  // Charge les produits au chargement de la page ou lors d'un changement d'email utilisateur
  useEffect(() => {
    if (email) {
      fetchData();
    }
  }, [email]);

  useEffect(() => {
    let filtered = transaction;

    if (selectedProduct) {
      filtered = filtered.filter((tx) => tx.productId === selectedProduct.id);
    }

    if (dateFrom) {
      filtered = filtered.filter(
        (tx) => new Date(tx.createdAt) <= new Date(dateFrom)
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(
        (tx) => new Date(tx.createdAt) <= new Date(dateTo)
      );
    }

    setFileteredTransaction(filtered);
    setCurrentPage(1);
  }, [selectedProduct, dateFrom, dateTo, transaction]);

  const totalPages = useMemo(
    () => Math.ceil(fileteredTransaction.length / ITEMS_PER_PAGE),
    [fileteredTransaction.length]
  );

  // si totalPages diminue (ex: via filtre), on ajuste la page courante
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1); // optionnel: garder 1 quand il n'y a rien
    } else if (currenPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currenPage]);

  
const startIndex = useMemo(
  () => (currenPage - 1) * ITEMS_PER_PAGE,
  [currenPage]
);

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

        {fileteredTransaction.length > ITEMS_PER_PAGE && (
          <div className="join grid grid-cols-3 space-x-3">
            <button
              className="join-item btn btn-outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currenPage === 1}
            >
              «
            </button>
            <div className="text-primary text-sm">
              Page {currenPage}/{totalPages}
            </div>
            <button
              className="join-item btn btn-outline"
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
