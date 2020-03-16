type ParentData = { node: TreeNode, my_side: "left" | "right" };
export class TreeNode {
    constructor(public readonly value: number) {}

    // === Core tree data structure methods (getters and setters are technically just methods!)
    private _parent?: ParentData;
    private _left?: TreeNode;
    private _right?: TreeNode;

    get left() {
        return this._left;
    }

    set left(node) {
        this._left = node;
        if (node != null) node._parent = { node: this, my_side: "left" };
    }

    get right() {
        return this._right;
    }

    set right(node) {
        this._right = node;
        if (node != null) node._parent = { node: this, my_side: "right" };
    }

    get parent(): ParentData | undefined {
        return this._parent;
    }

    // === Compound operations
    // The root of a rotation operation is defined as the pivot's (this node's) parent.
    // rotate() takes the pivot and moves it to the root's position in the tree, moving the root to the appropriate side of the node (depending on both nodes' relative values).
    // Rules of rotate:
    // 1. The order of values must be preserved
    // 2. The operation should take O(1)
    // 3. The pivot should be moved to the root and the root--alongside all other relocated nodes--should be properly relocated (see 1 & 2).
    rotate() {
        console.assert(this._parent != null, "Tree rotations may not be performed on the tree root.");
        const { node: root, my_side: my_side_of_root } = this._parent!;

        // Swap pivot and roots' positions (root = pivot)
        if (root._parent != null) {  // The root has a parent.
            root._parent.node[root._parent.my_side] = this;
        } else {  // We are now the tree root. No parent to rule us now!
            this._parent = undefined;
        }

        // Reposition the root
        const root_relative_side = my_side_of_root === "left" ? "right"  // pivot.value < root.value  Thus: root should be on the pivot's right branch.
            : "left";  // root.value < pivot.value  Thus: root should be on the pivot's left branch.  NOTE: We assume that two nodes in a tree won't have the same value.

        const displaced_node = this[root_relative_side];  // We're about to displace this node.
        this[root_relative_side] = root;  // Stick the root where it should be (see above).
        root[my_side_of_root] = displaced_node;  // Put the displaced node in a suitable place.
        // ^ This works because my_side_of_root used to refer to me but since that's no longer true in the tree format, this reference essentially becomes null (if we didn't do this operation, we'd have to set it to null)
        // We can see that this placement will always be the proper place to put it because:

        // Case 1:
        // root_relative_side == "right": `(all nodes in pivot) < root` (see above)
        // => displaced_node is on our right: `pivot < displaced_node`
        // => displaced_node is a node in pivot: displaced_node < root
        // => pivot < displaced_node < root (thus we can put it in our root_relative_side ie "right")

        // Case 2:
        // root_relative_side == "left": `root < (all nodes in pivot)` (see above)
        // => displaced_node is on our left: `displaced_node < pivot`
        // => displaced_node is a node in pivot: root < displaced_node
        // => root < displaced_node < pivot (thus we can put it in our root_relative_side ie "left")
    }

    removeFromTree() {
        console.assert(this._parent != null, "Remove from the tree can not be performed on the root.");
        const { node: parent_node, my_side } = this._parent!;
        parent_node[my_side] = undefined;  // We have vanished!
    }
}